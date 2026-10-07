"use client"

import { useTranslations } from "next-intl"
import { ReactNode, useEffect, useState } from "react"

import { ErrorTemplate } from "./error-template"

export function MobileScreenBlocker({ children }: { children: ReactNode }) {
    const t = useTranslations("Errors.MobileNotSupported")
    const [isMobile, setIsMobile] = useState<boolean | null>(null)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkScreenSize()

        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    if (isMobile === null) {
        return null
    }

    if (isMobile) {
        return (
            <ErrorTemplate
                iconSrc="/network-error-icon.svg"
                title={t("title")}
                description={t("description")}
                actionText=""
            />
        )
    }

    return <>{children}</>
}
