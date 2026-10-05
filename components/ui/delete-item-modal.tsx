"use client"

import { cn } from "cn"
import type { ReactNode } from "react"

import { BaseModal } from "./base-modal"

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    title: string
    description: ReactNode
    cancelText: string
    confirmText: string
    deletingText: string
    isDeleting: boolean
    error?: string | null
    dialogClassName?: string
    formClassName?: string
    overlayClassName?: string
    titleClassName?: string
    footerClassName?: string
    cancelButtonClassName?: string
    confirmButtonClassName?: string
    descriptionClassName?: string
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    cancelText,
    confirmText,
    deletingText,
    isDeleting,
    error,
    dialogClassName,
    formClassName,
    overlayClassName,
    titleClassName,
    footerClassName,
    cancelButtonClassName,
    confirmButtonClassName,
    descriptionClassName,
}: DeleteModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            error={error}
            isPending={isDeleting}
            cancelText={cancelText}
            confirmText={confirmText}
            pendingText={deletingText}
            confirmButtonVariant="destructive"
            dialogClassName={dialogClassName}
            formClassName={formClassName}
            overlayClassName={overlayClassName}
            titleClassName={titleClassName}
            footerClassName={footerClassName}
            cancelButtonClassName={cancelButtonClassName}
            confirmButtonClassName={confirmButtonClassName}
            onConfirm={onConfirm}
        >
            <p
                className={cn(
                    "mb-2 text-sm text-foreground",
                    descriptionClassName,
                )}
            >
                {description}
            </p>
        </BaseModal>
    )
}
