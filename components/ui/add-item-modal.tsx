"use client"

import { cn } from "cn"

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
    itemPlaceholder: string
    allItemsAddedText: string
    addingText: string
    submitText: string
    cancelText: string
    error?: string | null
    isSubmitting: boolean
    isValid: boolean

    selectedId: string
    onSelectChange: (value: string | null) => void
    availableOptions: ItemOption[]

    levelSelectNode: React.ReactNode

    onSubmit: (e: React.SyntheticEvent) => void
}

export function AddItemModal({
    isOpen,
    onClose,
    title,
    itemPlaceholder,
    allItemsAddedText,
    addingText,
    submitText,
    cancelText,
    error,
    isSubmitting,
    isValid,
    selectedId,
    onSelectChange,
    availableOptions,
    levelSelectNode,
    onSubmit,
}: AddItemModalProps) {
    const hasValue = Boolean(selectedId)

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
            <div className="flex flex-col gap-4">
                <div className="relative w-full pt-4">
                    {hasValue && (
                        <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                            {itemPlaceholder}
                        </span>
                    )}

                    <Select value={selectedId} onValueChange={onSelectChange}>
                        <SelectTrigger
                            className={cn(
                                "w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none outline-none transition-colors",
                                !hasValue && "text-muted-foreground",
                            )}
                        >
                            <div className="truncate">
                                <SelectValue placeholder={itemPlaceholder}>
                                    {selectedId
                                        ? availableOptions.find(
                                              (option) =>
                                                  String(option.id) ===
                                                  selectedId,
                                          )?.name
                                        : undefined}
                                </SelectValue>
                            </div>
                        </SelectTrigger>

                        <SelectContent
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignItemWithTrigger={false}
                            className="max-h-60 overflow-y-auto p-0 shadow-xl rounded-none border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545]"
                        >
                            {availableOptions.length > 0 ? (
                                availableOptions.map((item) => {
                                    const isSelected =
                                        selectedId === String(item.id)
                                    return (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                            className={cn(
                                                "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                                "[&_svg]:hidden pr-4",
                                                isSelected
                                                    ? "bg-[#626262] !text-[#F5F5F7] [&_*]:!text-[#F5F5F7] focus:bg-[#626262] dark:bg-[#F5F5F7] dark:!text-[#2E2E2E] dark:[&_*]:!text-[#2E2E2E]"
                                                    : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-[#626262] dark:hover:bg-[#626262]",
                                            )}
                                        >
                                            <span className="font-sans font-normal">
                                                {item.name}
                                            </span>
                                        </SelectItem>
                                    )
                                })
                            ) : (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    {allItemsAddedText}
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full">{levelSelectNode}</div>
            </div>
        </BaseModal>
    )
}
