"use client"

import { BaseModal } from "./base-modal"

interface DeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
    title: string
    description: string
    cancelText: string
    confirmText: string
    deletingText: string
    isDeleting: boolean
    error?: string | null
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
            onConfirm={onConfirm}
        >
            <p className="mb-2 text-sm text-muted-foreground">{description}</p>
        </BaseModal>
    )
}
