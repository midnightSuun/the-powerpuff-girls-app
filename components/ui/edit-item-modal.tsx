"use client"

import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"

import { BaseModal } from "./base-modal"

interface EditItemModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    itemNameLabel: string
    itemNameValue: string
    levelSelectLabel: string
    cancelText: string
    submitText: string
    updatingText: string
    error?: string | null
    isSubmitting: boolean
    isValid: boolean

    levelSelectNode: React.ReactNode

    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function EditItemModal({
    isOpen,
    onClose,
    title,
    itemNameLabel,
    itemNameValue,
    levelSelectLabel,
    cancelText,
    submitText,
    updatingText,
    error,
    isSubmitting,
    isValid,
    levelSelectNode,
    onSubmit,
}: EditItemModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={cancelText}
            confirmText={submitText}
            pendingText={updatingText}
            onSubmit={onSubmit}
        >
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {itemNameLabel}
                </span>
                <Select disabled value={itemNameValue}>
                    <SelectTrigger className="w-full border border-[#D1D1D1] bg-[#C8C8CC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-600 dark:text-gray-300 opacity-80 shadow-none rounded-none cursor-not-allowed">
                        <SelectValue>{itemNameValue}</SelectValue>
                    </SelectTrigger>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {levelSelectLabel}
                </span>
                {levelSelectNode}
            </div>
        </BaseModal>
    )
}
