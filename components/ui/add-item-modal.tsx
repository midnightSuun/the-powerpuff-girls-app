"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { BaseModal } from "./base-modal"

export interface ItemOption {
    id: string | number
    name: string
}

interface AddItemModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    skillPlaceholder: string
    allSkillsAddedText: string
    addingText: string
    submitText: string
    cancelText: string
    error?: string | null
    isSubmitting: boolean
    isValid: boolean

    selectedId: string
    onSelectChange: (value: string | null) => void
    availableOptions: ItemOption[]

    proficiencySelectNode: React.ReactNode

    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function AddItemModal({
    isOpen,
    onClose,
    title,
    skillPlaceholder,
    allSkillsAddedText,
    addingText,
    submitText,
    cancelText,
    error,
    isSubmitting,
    isValid,
    selectedId,
    onSelectChange,
    availableOptions,
    proficiencySelectNode,
    onSubmit,
}: AddItemModalProps) {
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
            pendingText={addingText}
            onSubmit={onSubmit}
        >
            <Select value={selectedId} onValueChange={onSelectChange}>
                <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none">
                    <SelectValue placeholder={skillPlaceholder}>
                        {selectedId
                            ? availableOptions.find(
                                  (s) => String(s.id) === selectedId,
                              )?.name
                            : undefined}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    alignItemWithTrigger={false}
                    className="max-h-60 overflow-y-auto border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545] text-gray-900 dark:text-foreground p-1 shadow-lg rounded-none"
                >
                    {availableOptions.length > 0 ? (
                        availableOptions.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                            {allSkillsAddedText}
                        </div>
                    )}
                </SelectContent>
            </Select>

            {proficiencySelectNode}
        </BaseModal>
    )
}
