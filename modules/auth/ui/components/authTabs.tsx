"use client"

import Link from "next/link"

interface AuthTabsProps {
    activeTab: "signin" | "signup"
    isDarkMode?: boolean
}

export function AuthTabs({ activeTab, isDarkMode = true }: AuthTabsProps) {
    const isSignIn = activeTab === "signin"

    return (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex space-x-16 text-sm font-semibold tracking-wider">
            <div className={`relative pb-3 ${isSignIn ? "text-red-500" : ""}`}>
                <Link
                    href="/login"
                    className={`transition-opacity hover:opacity-80 ${
                        !isSignIn
                            ? isDarkMode
                                ? "text-[#F5F5F7]"
                                : "text-neutral-500"
                            : ""
                    }`}
                >
                    SIGN IN
                </Link>
                {isSignIn && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-red-500" />
                )}
            </div>

            <div className={`relative pb-3 ${!isSignIn ? "text-red-500" : ""}`}>
                <Link
                    href="/register"
                    className={`transition-opacity hover:opacity-80 ${
                        isSignIn
                            ? isDarkMode
                                ? "text-[#F5F5F7]"
                                : "text-neutral-500"
                            : "text-red-500"
                    }`}
                >
                    SIGN UP
                </Link>
                {!isSignIn && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-red-500" />
                )}
            </div>
        </div>
    )
}
