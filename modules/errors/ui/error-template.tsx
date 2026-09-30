"use client"

import { ReactNode, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

type ErrorTemplateProps = {
    iconSrc: string
    title: string
    description: ReactNode
    actionText?: string
    onAction?: () => void
}

export function ErrorTemplate({
    iconSrc,
    title,
    description,
    actionText = "Retry",
    onAction,
}: ErrorTemplateProps) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            return document.documentElement.classList.contains("dark")
        }
        return false
    })

    const toggleTheme = () => {
        const newMode = !isDarkMode
        setIsDarkMode(newMode)
        if (newMode) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else {
            window.location.reload()
        }
    }

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-background text-foreground transition-colors duration-300 relative">
            <div className="absolute top-6 right-6">
                <Button
                    type="button"
                    onClick={toggleTheme}
                    variant="ghost"
                    className="text-xs px-3 py-1.5 h-auto border border-border bg-card text-card-foreground hover:bg-muted cursor-pointer"
                >
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                </Button>
            </div>

            <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
                <div className="mb-2 w-32 h-24 flex items-center justify-center">
                    <img
                        src={iconSrc}
                        alt={title}
                        className="w-full h-full object-contain dark:invert"
                    />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>

                <p className="text-xs text-muted-foreground leading-relaxed">
                    {description}
                </p>

                {onAction || actionText ? (
                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={handleAction}
                            className="w-36 bg-button-primary-default hover:bg-button-primary-default/90 text-white font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer"
                        >
                            {actionText}
                        </Button>
                    </div>
                ) : null}
            </div>
        </main>
    )
}
