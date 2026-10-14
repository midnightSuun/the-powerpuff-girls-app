"use client"

import { cn } from "cn"

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

    onSubmit: (e: React.SyntheticEvent) => void
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
            <div className="flex flex-col gap-4">
                <div className="relative w-full pt-4">
                    <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                        {itemNameLabel}
                    </span>

                    <Select disabled value={itemNameValue}>
                        <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#C8C8CC] dark:bg-[#454545] opacity-80 px-4 py-6 text-sm text-gray-600 dark:text-gray-300 shadow-none focus:ring-0 rounded-none outline-none transition-colors cursor-not-allowed">
                            <div className="truncate">
                                <SelectValue>{itemNameValue}</SelectValue>
                            </div>
                        </SelectTrigger>
                    </Select>
                </div>

                <div className="w-full">{levelSelectNode}</div>
            </div>
        </BaseModal>
    )
}
