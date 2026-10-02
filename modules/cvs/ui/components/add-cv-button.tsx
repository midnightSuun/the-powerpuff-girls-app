"use client"

import { useTranslations } from "next-intl"

import { AddItemButton } from "@/components/ui/list-management-buttons"

interface CreateCvTriggerButtonProps {
    onClick: () => void
    disabled?: boolean
}

export function CreateCvTriggerButton({
    onClick,
    disabled,
}: CreateCvTriggerButtonProps) {
    const t = useTranslations("CV.list")

    return (
        <AddItemButton
            label={t("create")}
            onClick={onClick}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold"
        />
    )
}
