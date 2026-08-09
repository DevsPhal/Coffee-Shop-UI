"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Modal({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />
}

function ModalTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />
}

function ModalPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="modal-portal" {...props} />
}

function ModalClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />
}

function ModalBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="modal-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function ModalContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <ModalPortal>
      <ModalBackdrop />
      <DialogPrimitive.Popup
        data-slot="modal-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 border border-gray-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all duration-200 rounded-2xl outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </ModalPortal>
  )
}

function ModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex flex-col gap-1 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 gap-2 mt-3",
        className
      )}
      {...props}
    />
  )
}

function ModalTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn(
        "text-lg font-semibold leading-tight tracking-tight text-gray-900",
        className
      )}
      {...props}
    />
  )
}

function ModalDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn("text-xs sm:text-sm text-gray-500 font-normal leading-normal", className)}
      {...props}
    />
  )
}

// Aliases for Dialog naming convention compatibility
const Dialog = Modal
const DialogTrigger = ModalTrigger
const DialogPortal = ModalPortal
const DialogClose = ModalClose
const DialogBackdrop = ModalBackdrop
const DialogContent = ModalContent
const DialogHeader = ModalHeader
const DialogFooter = ModalFooter
const DialogTitle = ModalTitle
const DialogDescription = ModalDescription

export {
  Modal,
  ModalPortal,
  ModalBackdrop,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
