"use client"

import { cn } from "cn"
import { X } from "lucide-react"
import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface BaseModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    error?: string | null
    isPending: boolean
    isValid?: boolean
    cancelText: string
    confirmText: string
    pendingText: string

    confirmButtonVariant?: ComponentProps<typeof Button>["variant"] | string
    dialogClassName?: string
    formClassName?: string
    overlayClassName?: string
    titleClassName?: string
    footerClassName?: string
    cancelButtonClassName?: string
    confirmButtonClassName?: string

    children: React.ReactNode

    onSubmit?: (e: React.SyntheticEvent) => void
    onConfirm?: () => void
}

export function BaseModal({
    isOpen,
    onClose,
    title,
    error,
    isPending,
    isValid = true,
    cancelText,
    confirmText,
    pendingText,
    confirmButtonVariant = "primary",
    dialogClassName,
    formClassName,
    overlayClassName,
    titleClassName,
    footerClassName,
    cancelButtonClassName,
    confirmButtonClassName,
    children,
    onSubmit,
    onConfirm,
}: BaseModalProps) {
    useBodyScrollLock(isOpen)
    const dialogRef = useRef<HTMLDivElement>(null)
    const firstFocusableRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isPending) {
                onClose()
            }
        }

        const handleTabTrap = (event: KeyboardEvent) => {
            if (event.key !== "Tab" || !dialogRef.current) return

            const focusableElements = dialogRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            )
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[
                focusableElements.length - 1
            ] as HTMLElement

            if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault()
                firstElement?.focus()
            }

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault()
                lastElement?.focus()
            }
        }

        document.addEventListener("keydown", handleEscape)
        document.addEventListener("keydown", handleTabTrap)
        setTimeout(() => {
            firstFocusableRef.current?.focus()
        }, 50)

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.removeEventListener("keydown", handleTabTrap)
        }
    }, [isOpen, onClose, isPending])

    if (!isOpen) return null

    const content = (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
                "relative w-full max-w-155 rounded-none border-none bg-background p-6 text-foreground shadow-2xl dark:bg-auth-bg md:p-8",
                dialogClassName,
            )}
        >
            <div className="mb-4 flex items-center justify-between md:mb-6">
                <p
                    id="modal-title"
                    className={cn(
                        "text-lg font-semibold text-foreground md:text-xl md:font-medium",
                        titleClassName,
                    )}
                >
                    {title}
                </p>
                <button
                    ref={firstFocusableRef}
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    aria-label="Close modal"
                    className="cursor-pointer rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-none bg-red-100 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-4">{children}</div>

            <div
                className={cn(
                    "mt-6 flex items-center justify-end gap-3",
                    footerClassName,
                )}
            >
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isPending}
                    className={cn(cancelButtonClassName)}
                >
                    {cancelText}
                </Button>
                <Button
                    type={onSubmit ? "submit" : "button"}
                    variant={
                        (confirmButtonVariant as ComponentProps<
                            typeof Button
                        >["variant"]) ?? "primary"
                    }
                    onClick={onConfirm}
                    disabled={!isValid || isPending}
                    className={cn(confirmButtonClassName)}
                >
                    {isPending ? pendingText : confirmText}
                </Button>
            </div>
        </div>
    )

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
                overlayClassName,
            )}
            onClick={(e) => {
                if (e.target === e.currentTarget && !isPending) {
                    onClose()
                }
            }}
        >
            {onSubmit ? (
                <form
                    onSubmit={onSubmit}
                    className={cn(
                        "flex w-full max-w-155 flex-col",
                        formClassName,
                    )}
                >
                    {content}
                </form>
            ) : (
                content
            )}
        </div>
    )
}
