"use server"

import { getGql } from "@/gql"

export type VerificationActionState = {
    error?: string
}

const SEND_VERIFICATION_MUTATION = `
    mutation SendVerification($email: String!) {
        sendVerification(email: $email)
    }
`

const VERIFY_MAIL_MUTATION = `
    mutation VerifyMail($mail: VerifyMailInput!) {
        verifyMail(mail: $mail)
    }
`

export async function sendVerificationAction(
    email: string,
): Promise<VerificationActionState> {
    if (!email.trim()) {
        return { error: "Email address is unavailable. Please sign in again." }
    }

    try {
        const gql = await getGql()
        await gql.request<unknown, { email: string }>(
            SEND_VERIFICATION_MUTATION,
            { email: email.trim() },
        )
    } catch {
        return {
            error: "Failed to send the verification email. Please try again.",
        }
    }

    return {}
}

export async function verifyMailAction(
    otp: string,
): Promise<VerificationActionState> {
    try {
        const gql = await getGql()
        await gql.request<unknown, { mail: { otp: string } }>(
            VERIFY_MAIL_MUTATION,
            { mail: { otp } },
        )
    } catch {
        return {
            error: "The verification code is invalid or has expired. Please try again.",
        }
    }

    return {}
}
