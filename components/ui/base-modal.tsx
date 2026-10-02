"use client"

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
    children,
    onSubmit,
    onConfirm,
}: BaseModalProps) {
    if (!isOpen) return null

    const content = (
        <div className="relative w-full max-w-155 rounded-none md:rounded-xl border border-border bg-background dark:bg-auth-bg dark:border-auth-card-border p-6 md:p-8 text-foreground shadow-2xl">
            <div className="mb-4 md:mb-6 flex items-center justify-between">
                <p className="text-lg md:text-xl font-semibold md:font-medium text-foreground">
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

            <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={isPending}
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
                >
                    {isPending ? pendingText : confirmText}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            {onSubmit ? (
                <form
                    onSubmit={onSubmit}
                    className="w-full max-w-155 flex flex-col"
                >
                    {content}
                </form>
            ) : (
                content
            )}
        </div>
    )
}
