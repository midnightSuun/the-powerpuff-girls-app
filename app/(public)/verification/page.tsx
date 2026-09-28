import { EmailVerification } from "@/modules/auth/ui/email-verification"

export default async function VerificationPage({
    searchParams,
}: PageProps<"/verification">) {
    const { email, sendFailed } = await searchParams

    return (
        <EmailVerification
            email={typeof email === "string" ? email : ""}
            sendFailed={sendFailed === "1"}
        />
    )
}
