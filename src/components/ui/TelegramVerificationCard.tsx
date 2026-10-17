"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  CircleX,
  Clock3,
  Coffee,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  ScanLine,
  Send,
  ShieldCheck,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { TelegramLogin, TelegramLoginFailure } from "@/hooks/useTelegramLogin";

const BOT_NUDGE_DELAY_MS = 20_000;
const LOW_TIME_SECONDS = 60;

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Open Telegram", icon: Send },
  { label: "Press Start", icon: Play },
  { label: "Tap Confirm Login", icon: ShieldCheck },
];

const FAILURES: Record<
  TelegramLoginFailure,
  { title: string; body: string; action: string; icon: LucideIcon; tone: string }
> = {
  expired: {
    title: "Verification expired",
    body: "This login link is no longer valid. Start a new one to continue.",
    action: "Try Again",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/10",
  },
  network: {
    title: "Unable to reach Telegram",
    body: "Check your internet connection, then try again.",
    action: "Retry",
    icon: WifiOff,
    tone: "bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/10",
  },
  rejected: {
    title: "Login cancelled",
    body: "You cancelled the login in Telegram. Nobody was signed in.",
    action: "Try Again",
    icon: CircleX,
    tone: "bg-slate-100 text-slate-600 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700/50",
  },
  error: {
    title: "Telegram sign-in failed",
    body: "Something went wrong. Please try again.",
    action: "Try Again",
    icon: TriangleAlert,
    tone: "bg-red-50 text-red-600 ring-red-100 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/10",
  },
};

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#3390EC] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";
const CTA_BASE = cn(
  "relative isolate flex h-14 w-full select-none items-center justify-center overflow-hidden rounded-2xl px-6 text-[15px] font-semibold transition-[transform,box-shadow,background-color,color] duration-200 ease-out",
  FOCUS_RING
);
const CTA_READY =
  "cursor-pointer bg-[#1F75C9] text-white shadow-[0_10px_24px_-12px_rgba(31,117,201,0.75)] hover:bg-[#1A64AE] hover:shadow-[0_14px_28px_-12px_rgba(31,117,201,0.8)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]";
const CTA_BUSY = "cursor-default bg-[#EEF6FE] text-[#1A64AE] dark:bg-[#3390EC]/15 dark:text-[#9CC8F5]";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function useRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const nextId = useRef(0);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const id = nextId.current++;
    setRipples((list) => [
      ...list,
      { id, size, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2 },
    ]);
  };

  const node = ripples.map((ripple) => (
    <span
      key={ripple.id}
      aria-hidden
      onAnimationEnd={() => setRipples((list) => list.filter((item) => item.id !== ripple.id))}
      className="pointer-events-none absolute rounded-full bg-white/30 animate-tg-ripple"
      style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
    />
  ));

  return { onPointerDown, node };
}

function CtaButton({ onClick, busy = false, children }: { onClick?: () => void; busy?: boolean; children: ReactNode }) {
  const ripple = useRipple();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy || undefined}
      onPointerDown={busy ? undefined : ripple.onPointerDown}
      className={cn(CTA_BASE, busy ? CTA_BUSY : CTA_READY)}
    >
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
      {ripple.node}
    </button>
  );
}

function CtaLink({
  href,
  waiting,
  onOpen,
  children,
}: {
  href: string;
  waiting: boolean;
  onOpen: () => void;
  children: ReactNode;
}) {
  const ripple = useRipple();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={waiting || undefined}
      onClick={(event) => {
        if (waiting) {
          event.preventDefault();
          return;
        }
        onOpen();
      }}
      onPointerDown={waiting ? undefined : ripple.onPointerDown}
      className={cn(CTA_BASE, waiting ? CTA_BUSY : CTA_READY)}
    >
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
      {ripple.node}
    </a>
  );
}

function ConnectionIllustration({ connected }: { connected: boolean }) {
  return (
    <div aria-hidden className="relative flex h-16 w-56 items-center justify-center">
      <span className="absolute left-4 top-1 size-2 rounded-full bg-[#3390EC]/25 motion-safe:animate-tg-float" />
      <span className="absolute right-7 top-0 size-3 rounded-full bg-[#3390EC]/15 motion-safe:animate-tg-float [animation-delay:-1.3s]" />
      <span className="absolute bottom-0 right-3 size-1.5 rounded-full bg-[#07112F]/20 motion-safe:animate-tg-float [animation-delay:-2.6s] dark:bg-white/20" />
      <span className="absolute bottom-2 left-9 size-2.5 rounded-full bg-[#07112F]/10 motion-safe:animate-tg-float [animation-delay:-0.6s] dark:bg-white/10" />

      <span className="grid size-14 place-items-center rounded-2xl bg-[#07112F] text-white shadow-lg shadow-[#07112F]/20 dark:bg-white dark:text-[#07112F]">
        <Coffee className="size-6" />
      </span>
      <span className="mx-3 flex items-center gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className={cn(
              "size-1.5 rounded-full transition-colors duration-200",
              connected ? "bg-[#16A34A]" : "bg-[#3390EC] motion-safe:animate-tg-dot"
            )}
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-[#3390EC] text-white shadow-lg shadow-[#3390EC]/30 ring-8 ring-[#3390EC]/10">
        <Send className="size-6 -translate-x-px translate-y-px" />
      </span>
    </div>
  );
}

function SuccessMark() {
  return (
    <div aria-hidden className="grid size-20 place-items-center rounded-full bg-[#16A34A]/10 motion-safe:animate-tg-pop">
      <span className="grid size-14 place-items-center rounded-full bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/30">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} strokeDasharray={1} className="motion-safe:animate-tg-check" />
        </svg>
      </span>
    </div>
  );
}

function ProgressRing({ value, warn }: { value: number; warn: boolean }) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  return (
    <span aria-hidden className="relative grid size-10 shrink-0 place-items-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" className="stroke-[#E5E7EB] dark:stroke-slate-700" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, value)))}
          className={cn(
            "motion-safe:transition-[stroke-dashoffset,stroke] motion-safe:duration-200 motion-safe:ease-out",
            warn ? "stroke-amber-500" : "stroke-[#3390EC]"
          )}
        />
      </svg>
      <Loader2 className={cn("size-4 motion-safe:animate-spin", warn ? "text-amber-500" : "text-[#3390EC]")} />
    </span>
  );
}

function Steps({ active }: { active: number }) {
  const { t } = useLanguage();
  return (
    <ol aria-label={t("Steps")} className="grid grid-cols-3">
      {STEPS.map((step, index) => {
        const state = index < active ? "done" : index === active ? "active" : "todo";
        const Icon = step.icon;
        return (
          <li
            key={step.label}
            aria-current={state === "active" ? "step" : undefined}
            className="relative flex flex-col items-center gap-2 px-1 text-center"
          >
            {index > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[calc(-50%+30px)] right-[calc(50%+30px)] top-5.25 h-0.5 rounded-full transition-colors duration-200",
                  index <= active ? "bg-[#3390EC]" : "bg-[#E5E7EB] dark:bg-slate-700"
                )}
              />
            )}
            <span
              className={cn(
                "relative grid size-11 place-items-center rounded-2xl border transition-[background-color,border-color,color,box-shadow] duration-200",
                state === "done" && "border-green-200 bg-green-50 text-[#16A34A] dark:border-green-500/30 dark:bg-green-500/10",
                state === "active" &&
                  "border-[#3390EC]/40 bg-[#EEF6FE] text-[#1A64AE] shadow-[0_0_0_4px_rgba(51,144,236,0.12)] dark:bg-[#3390EC]/15 dark:text-[#9CC8F5]",
                state === "todo" && "border-[#E5E7EB] bg-[#F8FAFC] text-slate-400 dark:border-slate-700 dark:bg-slate-800/60"
              )}
            >
              <Icon aria-hidden className="size-4.5" />
              <span
                aria-hidden
                className={cn(
                  "absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-white text-[10px] font-bold dark:border-slate-900",
                  state === "done" && "bg-[#16A34A] text-white",
                  state === "active" && "bg-[#1F75C9] text-white",
                  state === "todo" && "bg-[#E5E7EB] text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                )}
              >
                {state === "done" ? <Check className="size-3" strokeWidth={3} /> : index + 1}
              </span>
            </span>
            <span
              className={cn(
                "text-xs leading-tight",
                state === "todo" ? "text-slate-500 dark:text-slate-400" : "font-semibold text-[#07112F] dark:text-white"
              )}
            >
              <span className="sr-only">
                {t("Step")} {index + 1}:{" "}
              </span>
              {t(step.label)}
              {state === "done" && <span className="sr-only"> ({t("done")})</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function TelegramVerificationCard({ login }: { login: TelegramLogin }) {
  const { t, tStatic } = useLanguage();
  const { phase, start, cancel, secondsLeft, totalSeconds, qrCode, botHandle } = login;
  const qrTitleId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const challenge = phase.kind === "waiting" ? phase.challenge : null;
  const botStarted = phase.kind === "waiting" && phase.botStarted;
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const [nudgeFor, setNudgeFor] = useState<string | null>(null);
  const opened = challenge !== null && openedFor === challenge.requestId;
  const awaitingConfirmation = opened || botStarted;
  const showBotNudge = challenge !== null && nudgeFor === challenge.requestId && !botStarted;
  const view = phase.kind === "signing-in" ? "success" : phase.kind === "failed" ? "failed" : "verify";
  const failure = phase.kind === "failed" ? FAILURES[phase.reason] : null;

  useEffect(() => {
    if (!challenge || !opened || botStarted) return;
    const timer = setTimeout(() => setNudgeFor(challenge.requestId), BOT_NUDGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [challenge, opened, botStarted]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [view]);

  const markOpened = () => {
    if (challenge) setOpenedFor(challenge.requestId);
  };

  const title =
    view === "success" ? t("Verified successfully") : failure ? t(failure.title) : t("Verify with Telegram");
  const subtitle =
    view === "success"
      ? t("Signing you in...")
      : phase.kind === "failed"
        ? phase.reason === "error"
          ? phase.fromApi
            ? tStatic(phase.message)
            : t(phase.message)
          : t(FAILURES[phase.reason].body)
        : t("Open our Telegram bot and confirm your login.");

  const announcement =
    view === "success"
      ? t("Verified successfully. Signing you in...")
      : view === "failed"
        ? ""
        : !challenge
          ? t("Connecting to Telegram...")
          : botStarted
            ? t("Telegram bot started. Tap Confirm Login in Telegram.")
            : opened
              ? t("Waiting for you to press Start in Telegram.")
              : t("Open Telegram, press Start, then tap Confirm Login.");

  const primaryAction =
    view === "success" ? null : failure ? (
      <CtaButton onClick={start}>
        <RotateCcw aria-hidden className="size-5" />
        {t(failure.action)}
      </CtaButton>
    ) : !challenge ? (
      <CtaButton busy>
        <Loader2 aria-hidden className="size-5 motion-safe:animate-spin" />
        {t("Connecting to Telegram...")}
      </CtaButton>
    ) : (
      <CtaLink href={challenge.deepLink} waiting={awaitingConfirmation} onOpen={markOpened}>
        {awaitingConfirmation ? (
          <>
            <Loader2 aria-hidden className="size-5 motion-safe:animate-spin" />
            {t("Waiting for confirmation...")}
          </>
        ) : (
          <>
            <Send aria-hidden className="size-5" />
            {t("Open Telegram")}
            <ExternalLink aria-hidden className="size-4 opacity-80" />
          </>
        )}
      </CtaLink>
    );

  return (
    <div className={cn("w-full", primaryAction && "pb-28 sm:pb-0")}>
      <div className="w-full pt-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-200 sm:rounded-3xl sm:border sm:border-[#E5E7EB] sm:bg-white sm:px-8 sm:pt-7 sm:pb-6 lg:short:pt-5 lg:short:pb-5 sm:shadow-[0_1px_2px_rgba(7,17,47,0.04),0_16px_40px_-20px_rgba(7,17,47,0.18)] dark:sm:border-slate-800 dark:sm:bg-slate-900">
        <div key={view} className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
          <header className="flex flex-col items-center text-center">
            {view === "success" ? (
              <SuccessMark />
            ) : failure ? (
              <div aria-hidden className={cn("grid size-16 place-items-center rounded-full ring-8 motion-safe:animate-tg-pop", failure.tone)}>
                <failure.icon className="size-7" />
              </div>
            ) : (
              <div className="lg:short:hidden"><ConnectionIllustration connected={botStarted} /></div>
            )}
            <h1
              ref={headingRef}
              tabIndex={-1}
              className={cn("mt-4 text-2xl font-bold tracking-tight text-[#07112F] outline-none dark:text-white", view === "verify" && "lg:short:mt-0")}
            >
              {title}
            </h1>
            <p className="mt-1.5 max-w-[34ch] text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
          </header>

          {primaryAction && <div className="mt-6 hidden sm:block lg:short:mt-4">{primaryAction}</div>}

          {view === "verify" && (
            <>
              <div className="mt-3 flex justify-center">
                {challenge ? (
                  <a
                    href={challenge.deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={markOpened}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-[#3390EC]/20 bg-[#EEF6FE] px-3 py-1 text-xs font-semibold text-[#1A64AE] transition-colors duration-200 hover:border-[#3390EC]/40 hover:bg-[#E1EEFC] dark:bg-[#3390EC]/15 dark:text-[#9CC8F5] dark:hover:bg-[#3390EC]/25",
                      FOCUS_RING
                    )}
                  >
                    <Bot aria-hidden className="size-3.5" />
                    <span className="sr-only">{t("Official bot")}: </span>
                    {botHandle}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <Bot aria-hidden className="size-3.5" />
                    {botHandle}
                  </span>
                )}
              </div>

              {showBotNudge && challenge && (
                <div
                  role="status"
                  className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200 dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    <Play className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{t("Start the Telegram bot first.")}</p>
                    <p className="text-xs leading-snug text-amber-800 dark:text-amber-300/90">
                      {t("Tap Start at the bottom of the chat.")}
                    </p>
                  </div>
                  <a
                    href={challenge.deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center rounded-full bg-[#07112F] px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#1b2647] dark:bg-white dark:text-[#07112F] dark:hover:bg-slate-200",
                      FOCUS_RING
                    )}
                  >
                    {t("Open Bot")}
                  </a>
                </div>
              )}

              <div className="mt-6 lg:short:mt-4">
                <Steps active={botStarted ? 2 : opened ? 1 : 0} />
              </div>

              <div className="my-5 flex items-center gap-3 lg:short:my-3">
                <div className="h-px flex-1 bg-[#E5E7EB] dark:bg-slate-700" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("or")}</span>
                <div className="h-px flex-1 bg-[#E5E7EB] dark:bg-slate-700" />
              </div>

              <section
                aria-labelledby={qrTitleId}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-center sm:flex-row-reverse sm:text-left dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="min-w-0 flex-1">
                  <h2
                    id={qrTitleId}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#07112F] dark:text-white"
                  >
                    <ScanLine aria-hidden className="size-4 text-[#3390EC]" />
                    {t("Scan instead")}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t("Use Telegram on your phone.")}</p>
                </div>
                <div className="shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-sm transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.03] dark:border-slate-700">
                  {qrCode ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCode}
                      alt={t("QR code that opens the 590st Cafe Telegram bot")}
                      width={152}
                      height={152}
                      className="size-38"
                    />
                  ) : (
                    <span aria-hidden className="block size-38 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
                  )}
                </div>
              </section>

              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left dark:border-slate-700 dark:bg-slate-900">
                <ProgressRing
                  value={challenge && totalSeconds > 0 ? secondsLeft / totalSeconds : 1}
                  warn={challenge !== null && secondsLeft <= LOW_TIME_SECONDS}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#07112F] dark:text-white">
                    {!challenge
                      ? t("Connecting to Telegram")
                      : botStarted
                        ? t("Waiting for your confirmation")
                        : t("Waiting for Telegram")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {challenge ? (
                      <>
                        <span className="font-medium tabular-nums">{formatCountdown(secondsLeft)}</span> {t("remaining")}
                      </>
                    ) : (
                      t("Preparing a secure login link...")
                    )}
                  </p>
                </div>
              </div>
            </>
          )}

          {view !== "success" && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={cancel}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-[#07112F] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  FOCUS_RING
                )}
              >
                <ArrowLeft aria-hidden className="size-4" />
                {t("Use email instead")}
              </button>
            </div>
          )}
        </div>
      </div>

      {primaryAction && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-20px_rgba(7,17,47,0.35)] backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-900/95">
          {primaryAction}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

export default TelegramVerificationCard;
