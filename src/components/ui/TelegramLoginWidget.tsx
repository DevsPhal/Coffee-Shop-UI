"use client";

import { Send } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";
import type { TelegramLogin } from "@/hooks/useTelegramLogin";

export function TelegramLoginWidget({ login }: { login: TelegramLogin }) {
  const { t } = useLanguage();

  if (!login.isAvailable) return null;

  return (
    <div className="w-full">
      <div className="my-[clamp(0.625rem,2vh,1rem)] flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          {t("or")}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={login.start}
          disabled={login.isLoadingConfig}
          className="flex h-[clamp(3.125rem,6.2vh,3.375rem)] w-full max-w-88 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1F75C9] px-6 text-base font-semibold text-white outline-none transition-[background-color,transform] duration-200 hover:bg-[#1A64AE] focus-visible:ring-2 focus-visible:ring-[#3390EC] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <Send className="h-4.5 w-4.5" aria-hidden />
          {t("Log in with Telegram")}
        </button>
        <p className="flex max-w-sm items-start gap-1.5 text-center text-sm leading-snug text-slate-500">
          <Send className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {t(
            "Opens our Telegram bot: tap Start, then Confirm. New to 590st Cafe? An account is created for you."
          )}
        </p>
      </div>
    </div>
  );
}

export default TelegramLoginWidget;
