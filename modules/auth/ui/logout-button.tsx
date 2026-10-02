"use client"

import { useTranslations } from "next-intl"

import { logout } from "../api/logout"

export const LogoutButton = () => {
    const t = useTranslations("Settings")

    return (
        <button
            type="button"
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
        >
            {t("logout")}
        </button>
    )
}
