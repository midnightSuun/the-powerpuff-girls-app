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

    const hasValue = Boolean(value)

    const getSelectedLabel = () => {
        if (!value) return ""
        const selectedOption = MASTERY_OPTIONS.find(
            (option) => option.value === value,
        )
        return selectedOption
            ? t(`masteryLevels.${selectedOption.label}`)
            : value
    }

    return (
        <div className="relative w-full pt-6">
            {hasValue && (
                <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                    {t("masteryPlaceholder")}
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
                            : t("masteryPlaceholder")}
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
                    {MASTERY_OPTIONS.map(({ value: mastery, label }) => {
                        const isSelected = value === mastery

                        return (
                            <SelectItem
                                key={mastery}
                                value={mastery}
                                className={cn(
                                    "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors",
                                    "rounded-none",
                                    "[&>span]:hidden pr-4",
                                    isSelected
                                        ? "bg-button-secondary-default text-[#F5F5F7] focus:bg-button-secondary-default focus:text-[#F5F5F7] dark:bg-[#F5F5F7] dark:text-[#2E2E2E] dark:focus:bg-[#F5F5F7] dark:focus:text-[#2E2E2E]"
                                        : "text-gray-900 focus:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-button-secondary-default",
                                )}
                            >
                                <span className="font-sans font-normal">
                                    {t(`masteryLevels.${label}`)}
                                </span>
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}
