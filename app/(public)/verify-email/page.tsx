"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { EmailVerification } from "@/modules/auth/ui/email-verification"

function VerificationContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const sendFailed = searchParams.get("sendFailed") === "true"
    const accessToken = searchParams.get("token") || undefined

    return (
        <EmailVerification
            email={email}
            sendFailed={sendFailed}
            accessToken={accessToken}
        />
    )
}

export default function VerificationPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <VerificationContent />
        </Suspense>
    )
}
