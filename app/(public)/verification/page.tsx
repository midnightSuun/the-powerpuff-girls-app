import { Suspense } from "react"

import { EmailVerification } from "@/modules/auth/ui/email-verification"

async function VerificationContent({
    searchParams,
}: {
    searchParams: Promise<{ email?: string; sendFailed?: string }>
}) {
    const resolvedParams = await searchParams
    const email = resolvedParams.email
    const sendFailed = resolvedParams.sendFailed

    return (
        <EmailVerification
            email={typeof email === "string" ? email : ""}
            sendFailed={sendFailed === "1"}
        />
    )
}

export default function VerificationPage({
    searchParams,
}: {
    searchParams: Promise<{ email?: string; sendFailed?: string }>
}) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
                    Loading...
                </div>
            }
        >
            <VerificationContent searchParams={searchParams} />
        </Suspense>
    )
}
