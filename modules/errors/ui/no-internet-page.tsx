"use client"

import { ErrorTemplate } from "./error-template"

type NoInternetPageProps = {
    onRetry?: () => void
    iconSrc?: string
}

export function NoInternetPage({
    onRetry,
    iconSrc = "/network-error-icon.svg",
}: NoInternetPageProps) {
    return (
        <ErrorTemplate
            iconSrc={iconSrc}
            title="Oops"
            description={
                <>
                    Something went wrong. We&apos;re already working on fixing
                    it.
                    <br />
                    Please try again or go back.
                </>
            }
            actionText="Retry"
            onAction={onRetry}
        />
    )
}
