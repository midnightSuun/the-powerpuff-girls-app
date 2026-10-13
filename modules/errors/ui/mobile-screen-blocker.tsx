"use client"

import { useTranslations } from "next-intl"
import { ReactNode } from "react"

import { ErrorTemplate } from "./error-template"

export function MobileScreenBlocker({ children }: { children: ReactNode }) {
    const t = useTranslations("Errors.MobileNotSupported")

    return (
        <>
            <div className="max-md:hidden md:contents">{children}</div>
            <div className="hidden max-md:block">
                <ErrorTemplate
                    iconSrc="/network-error-icon.svg"
                    title={t("title")}
                    description={t("description")}
                    actionText=""
                />
            </div>
        </>
    )
}
