"use client"

import { useTranslations } from "next-intl"
import { ReactNode } from "react"

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
    actionText,
    onAction,
}: ErrorTemplateProps) {
    const t = useTranslations("Common")
    const resolvedActionText =
        actionText !== undefined ? actionText : t("retry")

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else {
            window.location.reload()
        }
    }

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-background text-foreground transition-colors duration-300 relative">
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

                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {description}
                </p>

                {resolvedActionText && (
                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={handleAction}
                            className="w-36 bg-button-primary-default hover:bg-button-primary-default/90 text-white font-medium text-xs tracking-wider uppercase transition-colors cursor-pointer"
                        >
                            {resolvedActionText}
                        </Button>
                    </div>
                )}
            </div>
        </main>
    )
}
