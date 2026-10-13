"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
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

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger
                className={cn(
                    "w-full border px-4 py-6 text-sm shadow-none focus:ring-0 outline-none transition-colors",
                    "rounded-none bg-[#ECECEC] text-gray-800 border-[#D1D1D1]",
                    "dark:bg-[#454545] dark:text-foreground dark:border-auth-card-border",
                )}
            >
                <div className={!value ? "text-muted-foreground" : ""}>
                    <SelectValue placeholder={t("proficiencyPlaceholder")} />
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
                                    ? "bg-[#626262] !text-[#F5F5F7] [&_*]:!text-[#F5F5F7] focus:bg-[#626262] dark:bg-[#F5F5F7] dark:!text-[#2E2E2E] dark:[&_*]:!text-[#2E2E2E]"
                                    : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-[#626262] dark:hover:bg-[#626262]",
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
    )
}
