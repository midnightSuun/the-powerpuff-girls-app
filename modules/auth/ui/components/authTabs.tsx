"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

interface AuthTabsProps {
    activeTab: "signin" | "signup"
}

export function AuthTabs({ activeTab }: AuthTabsProps) {
    const t = useTranslations("Auth.Tabs")
    const isSignIn = activeTab === "signin"

    return (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex space-x-16 text-sm font-semibold tracking-wider">
            <div className={`relative pb-3 ${isSignIn ? "text-red-500" : ""}`}>
                <Link
                    href="/login"
                    className={`transition-colors hover:text-foreground ${
                        isSignIn ? "text-red-500" : "text-muted-foreground"
                    }`}
                >
                    {t("signIn")}
                </Link>
                {isSignIn && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-red-500" />
                )}
            </div>

            <div className={`relative pb-3 ${!isSignIn ? "text-red-500" : ""}`}>
                <Link
                    href="/register"
                    className={`transition-colors hover:text-foreground ${
                        !isSignIn ? "text-red-500" : "text-muted-foreground"
                    }`}
                >
                    {t("signup")}
                </Link>
                {!isSignIn && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-red-500" />
                )}
            </div>
        </div>
    )
}
