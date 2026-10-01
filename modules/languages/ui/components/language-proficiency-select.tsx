"use client"

import { useTranslations } from "next-intl"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Proficiency } from "@/gql/generated/graphql"

import { useLanguageProficiencySelect } from "../../hooks/use-language-proficiency-select"

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
            <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none">
                <SelectValue placeholder={t("proficiencyPlaceholder")} />
            </SelectTrigger>
            <SelectContent
                side="bottom"
                align="start"
                sideOffset={6}
                alignItemWithTrigger={false}
                className="max-h-60 overflow-y-auto border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545] text-gray-900 dark:text-foreground p-1 shadow-lg rounded-none"
            >
                {proficiencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                        {t(`proficiencyLevels.${level}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
