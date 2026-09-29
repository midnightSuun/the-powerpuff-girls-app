"use server"

import { ClientError } from "graphql-request"

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

const graphqlErrorMessage = (error: unknown) => {
    if (error instanceof ClientError) {
        return (
            error.response.errors?.map(({ message }) => message).join(" ") ?? ""
        )
    }

    return error instanceof Error ? error.message : ""
}

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
    accessToken?: string,
): Promise<VerificationActionState> {
    const normalizedOtp = otp.replace(/\D/g, "")

    if (normalizedOtp.length !== 6) {
        return {
            error: "The verification code is invalid or has expired. Please try again.",
        }
    }

    try {
        const gql = await getGql(accessToken)
        await gql.request<unknown, { mail: { otp: string } }>(
            VERIFY_MAIL_MUTATION,
            { mail: { otp: normalizedOtp } },
        )
    } catch (error) {
        const message = graphqlErrorMessage(error)

        if (/unauthor/i.test(message)) {
            return {
                error: "Your session expired. Please sign in and try again.",
            }
        }

        return {
            error: "The verification code is invalid or has expired. Please try again.",
        }
    }

    return {}
}
