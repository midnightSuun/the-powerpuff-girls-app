"use client"

import { cn } from "cn"
import { X } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

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
    confirmButtonVariant = "default",
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
    if (!isOpen) return null

    const content = (
        <div
            className={cn(
                "relative w-full max-w-155 rounded-none border border-border bg-background p-6 text-foreground shadow-2xl dark:border-auth-card-border dark:bg-auth-bg md:p-8",
                dialogClassName,
            )}
        >
            <div className="mb-4 md:mb-6 flex items-center justify-between">
                <p
                    className={cn(
                        "text-lg font-semibold text-foreground md:text-xl md:font-medium",
                        titleClassName,
                    )}
                >
                    {title}
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-none bg-red-100 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
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
                    className={cn(
                        "rounded-full border border-input bg-background px-8 py-2.5 text-sm font-normal shadow-none hover:bg-accent hover:text-accent-foreground",
                        cancelButtonClassName,
                    )}
                >
                    {cancelText}
                </Button>
                <Button
                    type={onSubmit ? "submit" : "button"}
                    variant={
                        confirmButtonVariant as ComponentProps<
                            typeof Button
                        >["variant"]
                    }
                    onClick={onConfirm}
                    disabled={!isValid || isPending}
                    className={cn(
                        "rounded-full bg-[#C93B32] px-8 py-2.5 text-sm font-normal text-white shadow-none hover:bg-[#B5332B]",
                        confirmButtonClassName,
                    )}
                >
                    {isPending ? pendingText : confirmText}
                </Button>
            </div>
        </div>
    )

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs",
                overlayClassName,
            )}
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
