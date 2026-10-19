"use client"

import { cn } from "cn"
import { ChevronDown, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import type { SelectOption } from "../select-option"

export const createUserFieldClassName =
    "h-12 w-full rounded border border-[#aeaeae] bg-transparent px-3 text-base leading-6 tracking-[0.15px] text-[#2e2e2e] shadow-none outline-none placeholder:text-[#626262] focus-visible:border-[#c63031] focus-visible:ring-0 md:text-base dark:bg-transparent dark:text-[#f5f5f7] dark:placeholder:text-[#aeaeae]"

export const disabledUserFieldClassName =
    "disabled:bg-[#e6e6e6] disabled:text-button-secondary-default disabled:opacity-100 dark:disabled:bg-[#3a3a3a] dark:disabled:text-[#aeaeae]"

export const CreateUserPasswordInput = ({
    label,
    value,
    onChange,
    disabled = false,
    showLabel = false,
}: {
    label: string
    value: string
    onChange?: (value: string) => void
    disabled?: boolean
    showLabel?: boolean
}) => {
    const t = useTranslations("Auth.Login")
    const [isVisible, setIsVisible] = useState(false)

    const handleToggleVisibility = () => {
        setIsVisible((current) => !current)
    }

    return (
        <div className="relative flex flex-col pt-4">
            {Boolean(value) && !disabled && (
                <span className="absolute left-0 top-0 text-[10px] text-muted-foreground">
                    {label}
                </span>
            )}
            <Input
                type={isVisible ? "text" : "password"}
                aria-label={label}
                placeholder={showLabel || disabled ? undefined : label}
                autoComplete="new-password"
                value={value}
                disabled={disabled}
                onChange={(event) => onChange?.(event.target.value)}
                className={cn(
                    createUserFieldClassName,
                    "pr-10",
                    disabled && disabledUserFieldClassName,
                )}
                endAdornment={
                    <button
                        type="button"
                        onClick={handleToggleVisibility}
                        aria-label={
                            isVisible ? t("hidePassword") : t("showPassword")
                        }
                        aria-pressed={isVisible}
                        className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 text-button-secondary-default outline-none hover:text-[#2e2e2e] focus-visible:ring-3 focus-visible:ring-button-primary-default/30 dark:text-[#aeaeae] dark:hover:text-[#f5f5f7]"
                    >
                        {isVisible ? (
                            <EyeOff aria-hidden className="size-5" />
                        ) : (
                            <Eye aria-hidden className="size-5" />
                        )}
                    </button>
                }
            />
        </div>
    )
}

export const CreateUserSelect = ({
    label,
    value,
    options,
    includeEmpty = true,
    disabled = false,
    onChange,
}: {
    label: string
    value: string
    options: SelectOption[]
    includeEmpty?: boolean
    disabled?: boolean
    onChange: (value: string) => void
}) => {
    const isPlaceholder = value.length === 0

    return (
        <Select
            value={value}
            onValueChange={(newValue) => onChange(newValue)}
            disabled={disabled}
        >
            <SelectTrigger
                className={cn(
                    "w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none outline-none transition-colors",
                    isPlaceholder && "text-muted-foreground",
                    disabled && disabledUserFieldClassName,
                )}
            >
                <SelectValue placeholder={label}>
                    {value
                        ? options.find((option) => String(option.id) === value)
                              ?.name
                        : undefined}
                </SelectValue>
            </SelectTrigger>
            <SelectContent
                side="bottom"
                align="start"
                sideOffset={0}
                alignItemWithTrigger={false}
                className="max-h-60 overflow-y-auto p-0 shadow-xl rounded-none border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545]"
            >
                {includeEmpty && (
                    <SelectItem
                        value=""
                        className={cn(
                            "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                            "[&_svg]:hidden pr-4",
                            value === ""
                                ? "bg-button-secondary-default text-[#F5F5F7]! **:text-[#F5F5F7]! focus:bg-button-secondary-default dark:bg-[#F5F5F7] dark:text-[#2E2E2E]! dark:**:text-[#2E2E2E]!"
                                : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-button-secondary-default dark:hover:bg-button-secondary-default",
                        )}
                    >
                        <span className="font-sans font-normal">{label}</span>
                    </SelectItem>
                )}
                {options.map((item) => {
                    const isSelected = value === String(item.id)
                    return (
                        <SelectItem
                            key={item.id}
                            value={String(item.id)}
                            className={cn(
                                "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                "[&_svg]:hidden pr-4",
                                isSelected
                                    ? "bg-button-secondary-default text-[#F5F5F7]! **:text-[#F5F5F7]! focus:bg-button-secondary-default dark:bg-[#F5F5F7] dark:text-[#2E2E2E]! dark:**:text-[#2E2E2E]!"
                                    : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-button-secondary-default dark:hover:bg-button-secondary-default",
                            )}
                        >
                            <span className="font-sans font-normal">
                                {item.name}
                            </span>
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}
