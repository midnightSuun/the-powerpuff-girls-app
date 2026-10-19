"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import type { Proficiency } from "@/gql/generated/graphql"

import { useLanguageProficiencySelect } from "../../../hooks/use-language-proficiency-select"

interface LanguageProficiencySelectProps {
    value: Proficiency | ""
    onValueChange: (value: Proficiency) => void
}

export function LanguageProficiencySelect({
    value,
    onValueChange,
}: LanguageProficiencySelectProps) {
    const t = useTranslations("Languages")

    const { proficiencyLevels, handleValueChange } =
        useLanguageProficiencySelect({
            onValueChange,
        })

    const hasValue = Boolean(value)

    const getSelectedLabel = () => {
        if (!value) return ""
        return t(`proficiencyLevels.${value}`)
    }

    return (
        <div className="relative w-full pt-4">
            {hasValue && (
                <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                    {t("proficiencyPlaceholder")}
                </span>
            )}

            <Select value={value} onValueChange={handleValueChange}>
                <SelectTrigger
                    className={cn(
                        "w-full border px-4 py-6 text-sm shadow-none focus:ring-0 outline-none transition-colors",
                        "rounded-none bg-[#ECECEC] text-gray-800 border-[#D1D1D1]",
                        "dark:bg-[#454545] dark:text-foreground dark:border-auth-card-border",
                        !hasValue && "text-muted-foreground",
                    )}
                >
                    <div className="truncate">
                        {hasValue
                            ? getSelectedLabel()
                            : t("proficiencyPlaceholder")}
                    </div>
                </SelectTrigger>

                <SelectContent
                    side="bottom"
                    align="start"
                    sideOffset={0}
                    alignItemWithTrigger={false}
                    className={cn(
                        "max-h-60 overflow-y-auto p-0 shadow-xl",
                        "rounded-none border border-[#D1D1D1] bg-[#F5F5F7]",
                        "dark:border-auth-card-border dark:bg-[#454545]",
                    )}
                >
                    {proficiencyLevels.map((level) => {
                        const isSelected = value === level

                        return (
                            <SelectItem
                                key={level}
                                value={level}
                                className={cn(
                                    "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                    "[&_svg]:hidden pr-4",
                                    isSelected
                                        ? "bg-button-secondary-defaultcondary-default text-[#F5F5F7]! **:text-[#F5F5F7]! focus:bg-button-secondary-default dark:bg-[#F5F5F7] dark:text-[#2E2E2E]! dark:**:text-[#2E2E2E]!"
                                        : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-button-secondary-default dark:hover:bg-button-secondary-default",
                                )}
                            >
                                <span className="font-sans font-normal">
                                    {t(`proficiencyLevels.${level}`)}
                                </span>
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}
