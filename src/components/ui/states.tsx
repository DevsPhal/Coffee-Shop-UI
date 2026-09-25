"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, RefreshCw, WifiOff, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/translatetokhmer";

/**
 * The one place the storefront's loading, error and empty states live, so every page waits,
 * fails and comes up empty the same way instead of each inventing its own grey box or line of
 * red text. Skeletons mirror the real card they stand in for, so nothing jumps when data lands.
 */

/* ----------------------------------------------------------------------------------------
 * Skeleton primitives
 * -------------------------------------------------------------------------------------- */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/**
 * Announces "loading" once to screen readers and hides the skeleton shapes themselves, which
 * carry no meaning of their own.
 */
export function LoadingRegion({
  label = "Loading...",
  className = "",
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      {children}
      {/* Last, and absolutely positioned by sr-only, so it never takes a grid cell or shifts
          sibling spacing like `.cards-container > * + *`. */}
      <span className="sr-only">{t(label)}</span>
    </div>
  );
}

/** Stands in for the default grid `Card` — same padding, image height and two action pills. */
export function ProductCardSkeleton() {
  return (
    <div className="skeleton_card flex flex-col rounded-lg border border-gray-100 bg-[#f8f8f8] p-5" aria-hidden>
      <Skeleton className="mb-4 h-44 w-full rounded-lg sm:h-48" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-5 w-14" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 flex-1 rounded-full" />
      </div>
    </div>
  );
}

/** Several product cards, returned bare so each page keeps its own grid wrapper. */
export function ProductCardSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
}

/** Stands in for the horizontal phone-menu card: thumbnail, two text lines, "+ ADD" pill. */
export function PhoneCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-[#f3e8ec] bg-white px-3 py-2.5 sm:px-4 sm:py-3.5"
      aria-hidden
    >
      <Skeleton className="h-20 w-20 shrink-0 rounded-2xl sm:h-22 sm:w-22" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-9 w-20 shrink-0 rounded-full" />
    </div>
  );
}

export function CategoryPillsSkeleton({ count = 6 }: { count?: number }) {
  const widths = ["w-28", "w-36", "w-24", "w-32", "w-28", "w-24", "w-32", "w-28"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`h-10 rounded-full ${widths[i % widths.length]}`} />
      ))}
    </>
  );
}

/** Stands in for a category tile on /category: icon + name, count, preview thumbnails, link. */
export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-hidden>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-md" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="mt-3 h-3 w-16" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <Skeleton className="h-14 w-14 rounded-xl" />
        <Skeleton className="h-14 w-14 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-3 w-28" />
    </div>
  );
}

/** Stands in for a bento event tile — same fixed height as `.event_card`. */
export function EventCardSkeleton() {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-2xl bg-[#f1f5f9]" aria-hidden>
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
        <Skeleton className="skeleton_on_dark h-5 w-2/3" />
        <Skeleton className="skeleton_on_dark h-3 w-full" />
        <Skeleton className="skeleton_on_dark h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Stands in for an order card: id + status, meta lines, item rows, total + actions. */
export function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-hidden>
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-2 border-b border-gray-100 py-3 sm:grid-cols-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="space-y-2 py-3">
        <div className="flex justify-between"><Skeleton className="h-3 w-36" /><Skeleton className="h-3 w-12" /></div>
        <div className="flex justify-between"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-12" /></div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Stands in for the whole product detail page: breadcrumb, square image, info panel. */
export function ProductDetailSkeleton() {
  return (
    <LoadingRegion label="Loading product..." className="product_detail_container font-sans">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="product_detail_grid">
        <Skeleton className="mx-auto aspect-square w-full max-w-[400px] rounded-3xl" />
        <div className="space-y-5 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-7 w-28" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-full" />
          </div>
        </div>
      </div>
    </LoadingRegion>
  );
}

/** Stands in for the profile card: round avatar, name + actions, tab bar, detail rows. */
export function ProfileCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 rounded-2xl border border-[#eaecf0] bg-white p-6 shadow-sm sm:flex-row"
      aria-hidden
    >
      <div className="flex shrink-0 justify-center">
        <Skeleton className="h-[120px] w-[120px] rounded-full sm:h-[140px] sm:w-[140px]" />
      </div>
      <div className="flex-1 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-7 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4 border-b border-gray-100 pb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-4">
          {["w-24", "w-48", "w-32", "w-28"].map((width, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className={`h-3 ${width}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------------------
 * Full-block states
 * -------------------------------------------------------------------------------------- */

/** For waits with no layout worth sketching (route Suspense, an order being looked up). */
export function PageLoader({ label = "Loading...", className = "" }: { label?: string; className?: string }) {
  const { t } = useLanguage();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 px-4 py-24 text-center font-sans ${className}`}
    >
      <Loader2 className="h-9 w-9 animate-spin text-[#A1255B]" aria-hidden />
      <p className="text-sm font-medium text-gray-500">{t(label)}</p>
    </div>
  );
}

function isNetworkError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === "FETCH_ERROR"
  );
}

/**
 * The customer-facing wording for a failed request. Unlike `apiErrorMessage` this never
 * surfaces developer hints (env var names, "the API") — a network failure reads as one.
 */
function friendlyErrorMessage(error: unknown, fallback: string) {
  if (isNetworkError(error)) return "Please check your internet connection and try again.";
  const body = (error as { data?: { message?: unknown } } | undefined)?.data;
  return typeof body?.message === "string" && body.message ? body.message : fallback;
}

export interface ErrorStateProps {
  title?: string;
  /** The RTK Query error; its message is shown when it carries one. */
  error?: unknown;
  /** Shown when the error has no message of its own. */
  message?: string;
  onRetry?: () => void;
  /** An optional way out besides retrying, e.g. back to the menu. */
  secondaryAction?: { label: string; href: string };
  compact?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  error,
  message = "We couldn't load this right now. Please try again.",
  onRetry,
  secondaryAction,
  compact = false,
  className = "",
}: ErrorStateProps) {
  const { t } = useLanguage();
  const offline = isNetworkError(error);
  const Icon = offline ? WifiOff : AlertTriangle;

  return (
    <div
      role="alert"
      className={`mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-red-100 bg-white text-center font-sans shadow-sm ${
        compact ? "px-5 py-6" : "px-6 py-10"
      } ${className}`}
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-base font-bold text-gray-900">
        {t(offline ? "You seem to be offline" : title)}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">
        {t(friendlyErrorMessage(error, message))}
      </p>
      {(onRetry || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-none bg-[#A1255B] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#A1255B]/20 transition-colors hover:bg-[#881d52] active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              {t("Try again")}
            </button>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t(secondaryAction.label)}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, message, action, className = "" }: EmptyStateProps) {
  const { t } = useLanguage();
  const actionClass =
    "mt-5 inline-flex cursor-pointer items-center justify-center rounded-full border-none bg-[#A1255B] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#A1255B]/20 transition-colors hover:bg-[#881d52]";

  return (
    <div
      className={`mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center font-sans ${className}`}
    >
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-[#A1255B]">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-base font-bold text-gray-900">{t(title)}</h3>
      {message && <p className="mt-1 text-xs leading-relaxed text-gray-500 sm:text-sm">{t(message)}</p>}
      {action &&
        (action.href ? (
          <Link href={action.href} className={actionClass}>
            {t(action.label)}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={actionClass}>
            {t(action.label)}
          </button>
        ))}
    </div>
  );
}
