"use client"

import * as React from "react"
import Image from "next/image"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
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
  render = <Button variant="outline" size="sm" />,
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
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
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

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = (
      <CircleCheckIcon aria-hidden="true" />
    )
  }

  if (type === "info") {
    icon = (
      <InfoIcon aria-hidden="true" />
    )
  }

  if (type === "warning") {
    icon = (
      <TriangleAlertIcon aria-hidden="true" />
    )
  }

  if (type === "error") {
    icon = (
      <OctagonXIcon className="text_destructive" aria-hidden="true" />
    )
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon className="animate_spin" aria-hidden="true" />
    )
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="toast_icon"
    >
      {icon}
    </span>
  )
}

/** Extra fields a `type: "welcome"` toast carries in `data` (see LoginWelcome). */
export interface WelcomeToastData {
  greeting: string
  initials: string
  avatarUrl?: string | null
  duration: number
}

/**
 * The post-login greeting: a card rather than the pill every other toast uses, with the
 * customer's avatar (or initials) and a bar that drains while the toast is on screen.
 * Mirrors the admin dashboard's WelcomeToast so both apps greet people the same way.
 */
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

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  const activeToasts = toasts.slice(-1)

  return activeToasts.map((toastItem) =>
    toastItem.type === "welcome" && toastItem.data ? (
      <Toast key={toastItem.id} toast={toastItem} data-type="welcome">
        <WelcomeToastBody data={toastItem.data as WelcomeToastData} />
      </Toast>
    ) : (
      <Toast key={toastItem.id} toast={toastItem} data-type={toastItem.type}>
        <ToastContent>
          <ToastIcon type={toastItem.type} />
          <div className="toast_details">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          <ToastClose />
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
