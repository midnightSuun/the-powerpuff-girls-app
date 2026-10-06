"use client"

import { useTranslations } from "next-intl"
import { toast } from "sonner"

type Action =
    | "created"
    | "updated"
    | "deleted"
    | "emailVerified"
    | "update"
    | "verifyEmail"

export function useActionNotifications() {
    const t = useTranslations("Notifications")

    const actionMessages: Record<Action, string> = {
        created: t("actions.created"),
        updated: t("actions.updated"),
        deleted: t("actions.deleted"),
        emailVerified: t("messages.verificationSent"),
        update: t("messages.profileUpdated"),
        verifyEmail: t("messages.verificationFailed"),
    }

    return {
        success: (action: Action | string) =>
            toast.success(t("success"), {
                description: actionMessages[action as Action] || action,
                closeButton: true,
            }),
        error: (action: Action | string) =>
            toast.error(t("error"), {
                description: actionMessages[action as Action] || action,
                closeButton: true,
            }),
        warning: (message: string) =>
            toast.warning(t("warning"), {
                description: message,
                closeButton: true,
            }),
        info: (message: string) =>
            toast.info(t("info"), {
                description: message,
                closeButton: true,
            }),
    }
}
