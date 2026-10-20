"use client"

import { useEffect } from "react"

import { NoInternetPage } from "@/modules/errors/ui/no-internet-page"

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Application error:", error)
    }, [error])

    return <NoInternetPage onRetry={reset} iconSrc="/network-error-icon.svg" />
}
