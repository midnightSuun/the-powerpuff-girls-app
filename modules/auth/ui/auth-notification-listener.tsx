"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

import { AUTH_NOTIFICATION_STORAGE_KEY } from "../consts"

export function AuthNotificationListener() {
    const pathname = usePathname()
    const notifications = useTranslations("Notifications")
    const authMessages = useTranslations("Auth.messages")

    useEffect(() => {
        const notification = sessionStorage.getItem(
            AUTH_NOTIFICATION_STORAGE_KEY,
        )

        if (!notification) return
        if (notification === "login" && pathname.endsWith("/login")) return

        sessionStorage.removeItem(AUTH_NOTIFICATION_STORAGE_KEY)

        if (notification === "login") {
            toast.success(notifications("success"), {
                description: authMessages("loginSuccess"),
                closeButton: true,
            })
        } else if (notification === "logout") {
            toast.success(notifications("success"), {
                description: notifications("logoutSuccess"),
                closeButton: true,
            })
        }
    }, [authMessages, notifications, pathname])

    return null
}
