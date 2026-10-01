"use client"

import { useTranslations } from "next-intl"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Mastery } from "@/gql/generated/graphql"

interface SkillMasterySelectProps {
    value: Mastery | ""
    onValueChange: (value: Mastery) => void
}

const MASTERY_OPTIONS = [
    { value: "Novice", label: "novice" },
    { value: "Advanced", label: "advanced" },
    { value: "Competent", label: "competent" },
    { value: "Proficient", label: "proficient" },
    { value: "Expert", label: "expert" },
] as const satisfies readonly { value: Mastery; label: string }[]

export function SkillMasterySelect({
    value,
    onValueChange,
}: SkillMasterySelectProps) {
    const t = useTranslations("Skills")

    const handleValueChange = (selectedValue: string | null) => {
        const selectedMastery = MASTERY_OPTIONS.find(
            (option) => option.value === selectedValue,
        )
        if (selectedMastery) {
            onValueChange(selectedMastery.value)
        }
    }

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none">
                <SelectValue placeholder={t("masteryPlaceholder")} />
            </SelectTrigger>
            <SelectContent
                side="bottom"
                align="start"
                sideOffset={6}
                alignItemWithTrigger={false}
                className="max-h-60 overflow-y-auto border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545] text-gray-900 dark:text-foreground p-1 shadow-lg rounded-none"
            >
                {MASTERY_OPTIONS.map(({ value: mastery, label }) => (
                    <SelectItem key={mastery} value={mastery}>
                        {t(`masteryLevels.${label}`)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
