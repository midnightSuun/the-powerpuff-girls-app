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
            iconOnlyBelowLg
            variant="primaryV2"
        />
    )
}
