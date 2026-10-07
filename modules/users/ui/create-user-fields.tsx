"use client"

import { cn } from "cn"
import { ChevronDown, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Input } from "@/components/ui/input"

export const createUserFieldClassName =
    "h-12 w-full rounded border border-[#aeaeae] bg-transparent px-3 text-base leading-6 tracking-[0.15px] text-[#2e2e2e] shadow-none outline-none placeholder:text-[#626262] focus-visible:border-[#c63031] focus-visible:ring-0 md:text-base dark:bg-transparent dark:text-[#f5f5f7] dark:placeholder:text-[#aeaeae]"

type SelectOption = {
    id: string
    name: string
}

export const CreateUserPasswordInput = ({
    label,
    value,
    onChange,
    disabled = false,
}: {
    label: string
    value: string
    onChange?: (value: string) => void
    disabled?: boolean
}) => {
    const t = useTranslations("Auth.Login")
    const [isVisible, setIsVisible] = useState(false)

    const handleToggleVisibility = () => {
        setIsVisible((current) => !current)
    }

    return (
        <div className="relative">
            <Input
                type={isVisible ? "text" : "password"}
                aria-label={label}
                placeholder={label}
                autoComplete="new-password"
                value={value}
                disabled={disabled}
                onChange={(event) => onChange?.(event.target.value)}
                className={cn(
                    createUserFieldClassName,
                    "pr-10",
                    disabled &&
                        "disabled:bg-[#e6e6e6] disabled:text-[#626262] disabled:opacity-100 dark:disabled:bg-[#3a3a3a] dark:disabled:text-[#aeaeae]",
                )}
            />
            <button
                type="button"
                onClick={handleToggleVisibility}
                aria-label={isVisible ? t("hidePassword") : t("showPassword")}
                aria-pressed={isVisible}
                className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 text-[#626262] outline-none hover:text-[#2e2e2e] focus-visible:ring-3 focus-visible:ring-[#c63031]/30 dark:text-[#aeaeae] dark:hover:text-[#f5f5f7]"
            >
                {isVisible ? (
                    <EyeOff aria-hidden className="size-5" />
                ) : (
                    <Eye aria-hidden className="size-5" />
                )}
            </button>
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
        <div className="relative">
            <select
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className={cn(
                    createUserFieldClassName,
                    "appearance-none pr-10",
                    isPlaceholder && "text-[#626262] dark:text-[#aeaeae]",
                )}
            >
                {includeEmpty ? <option value="">{label}</option> : null}
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
            <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-[#626262] dark:text-[#aeaeae]"
            />
        </div>
    )
}
