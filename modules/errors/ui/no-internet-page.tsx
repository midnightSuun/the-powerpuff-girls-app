"use client"

import { useTranslations } from "next-intl"

import { ErrorTemplate } from "./error-template"

type NoInternetPageProps = {
    onRetry?: () => void
    iconSrc?: string
}

export function NoInternetPage({
    onRetry,
    iconSrc = "/network-error-icon.svg",
}: NoInternetPageProps) {
    const t = useTranslations("Errors.NoInternet")

    return (
        <ErrorTemplate
            iconSrc={iconSrc}
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
            onAction={onRetry}
        />
    )
}
