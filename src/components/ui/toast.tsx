"use client"

import * as React from "react"
import Image from "next/image"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { BellIcon, XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import "@/app/globals.scss"

const toast = ToastPrimitive.createToastManager()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn("toast_viewport", className)}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn("toast", className)}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("toast_content", className)}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("toast_title", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("toast_description", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <button type="button" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("toast_action", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <button type="button" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Dismiss notification"
      render={render}
      className={cn("toast_close", className)}
      {...props}
    >
      {children ?? (
        <XIcon aria-hidden="true" />
      )}
    </ToastPrimitive.Close>
  )
}

const TOAST_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  success: CircleCheckIcon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
  loading: Loader2Icon,
}

function ToastIcon({ type }: { type: string | undefined }) {
  const Icon = TOAST_ICONS[type ?? ""] ?? BellIcon
  return (
    <span data-slot="toast-icon" className="toast_icon">
      <Icon className={type === "loading" ? "animate_spin" : undefined} aria-hidden="true" />
    </span>
  )
}

export interface WelcomeToastData {
  greeting: string
  initials: string
  avatarUrl?: string | null
  duration: number
}

function WelcomeToastBody({ data }: { data: WelcomeToastData }) {
  return (
    <ToastContent className="welcome_toast">
      <span className="welcome_toast_avatar" aria-hidden="true">
        {data.avatarUrl ? (
          <Image src={data.avatarUrl} alt="" fill sizes="44px" unoptimized className="welcome_toast_avatar_img" />
        ) : (
          data.initials
        )}
      </span>
      <div className="welcome_toast_text">
        <p className="welcome_toast_eyebrow">{data.greeting}</p>
        <ToastTitle className="welcome_toast_title" />
        <ToastDescription className="welcome_toast_desc" />
      </div>
      <ToastClose className="welcome_toast_close" />
      <span className="welcome_toast_progress" style={{ animationDuration: `${data.duration}ms` }} />
    </ToastContent>
  )
}

const SWIPE_DIRECTIONS: ToastPrimitive.Root.Props["swipeDirection"] = ["up", "right"]
const DEFAULT_TIMEOUT = 5000
const MAX_VISIBLE = 3

function ToastProgress({ timeout }: { timeout: number | undefined }) {
  const duration = timeout ?? DEFAULT_TIMEOUT
  if (duration <= 0) return null
  return <span className="toast_progress" aria-hidden="true" style={{ animationDuration: `${duration}ms` }} />
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  const activeToasts = toasts.slice(-MAX_VISIBLE)

  return activeToasts.map((toastItem) =>
    toastItem.type === "welcome" && toastItem.data ? (
      <Toast key={toastItem.id} toast={toastItem} data-type="welcome" swipeDirection={SWIPE_DIRECTIONS}>
        <WelcomeToastBody data={toastItem.data as WelcomeToastData} />
      </Toast>
    ) : (
      <Toast key={toastItem.id} toast={toastItem} data-type={toastItem.type ?? "default"} swipeDirection={SWIPE_DIRECTIONS}>
        <ToastContent>
          <ToastIcon type={toastItem.type} />
          <div className="toast_details">
            <ToastTitle />
            <ToastDescription />
            <ToastAction />
          </div>
          <ToastClose />
          {toastItem.type !== "loading" && <ToastProgress timeout={toastItem.timeout} />}
        </ToastContent>
      </Toast>
    )
  )
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
