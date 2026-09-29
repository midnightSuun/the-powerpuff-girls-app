import { Suspense } from "react"

import { EmailVerification } from "@/modules/auth/ui/email-verification"

type PageProps = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function VerificationContent({ searchParams }: PageProps) {
    const params = await searchParams
    const email = typeof params.email === "string" ? params.email : ""
    const sendFailed = params.sendFailed === "true"

    return <EmailVerification email={email} sendFailed={sendFailed} />
}

export default function VerificationPage({ searchParams }: PageProps) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <VerificationContent searchParams={searchParams} />
        </Suspense>
    )
}
