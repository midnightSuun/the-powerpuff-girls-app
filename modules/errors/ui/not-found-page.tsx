"use client"

import { useRouter } from "next/navigation"

import { ErrorTemplate } from "./error-template"

export function NotFoundPage() {
    const router = useRouter()

    return (
        <ErrorTemplate
            iconSrc="/network-error-icon.svg"

            title="Page Not Found"

            description={
                <>
                    The page you are looking for might have been removed,
                    <br />
                    had its name changed, or is temporarily unavailable.
                </>
            }

            actionText="Go Home"

            onAction={() => router.push("/")}
        />
    )
}
