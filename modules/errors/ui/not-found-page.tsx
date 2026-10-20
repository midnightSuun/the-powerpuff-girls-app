"use client"

import { useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"

import { ErrorTemplate } from "./error-template"

export function NotFoundPage() {
    const router = useRouter()
    const t = useTranslations("Errors.NotFound")

    return (
        <ErrorTemplate
            iconSrc="/network-error-icon.svg"
            title={t("title")}
            description={
                <>
                    {t("description")
                        .split("\n")
                        .map((line, index, arr) => (
                            <span key={index}>
                                {line}
                                {index < arr.length - 1 && <br />}
                            </span>
                        ))}
                </>
            }
            actionText={t("actionText")}
            onAction={() => router.push("/")}
        />
    )
}
