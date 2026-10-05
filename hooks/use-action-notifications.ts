"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"

type Action = "created" | "updated" | "deleted"

export function useActionNotifications() {
    const t = useTranslations("Notifications")
    const actionMessages = {
        created: t("actions.created"),
        updated: t("actions.updated"),
        deleted: t("actions.deleted"),
    }

    return {
        success: (action: Action) =>
            toast.success(t("success"), {
                description: actionMessages[action],
                closeButton: true,
            }),
    }
}
