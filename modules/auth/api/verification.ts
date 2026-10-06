"use server"

import { ClientError } from "graphql-request"
import { getTranslations } from "next-intl/server"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getUser } from "@/modules/users/api/get-user"

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

async function sendVerification(
    email: string,
): Promise<VerificationActionState> {
    const t = await getTranslations("Auth.messages")
    if (!email.trim()) {
        return { error: t("verificationEmailUnavailable") }
    }

    try {
        const gql = await getGql()
        await gql.request<unknown, { email: string }>(
            SEND_VERIFICATION_MUTATION,
            { email: email.trim() },
        )
    } catch {
        return {
            error: t("verificationSendFailed"),
        }
    }

    return {}
}

export async function sendVerificationAction(
    email: string,
): Promise<VerificationActionState> {
    return sendVerification(email)
}

export async function sendProfileVerificationAction(): Promise<VerificationActionState> {
    const t = await getTranslations("Auth.messages")
    const session = await getCurrentSession()

    if (!session) {
        return { error: t("sessionExpired") }
    }

    try {
        const user = await getUser(session.userId)
        return await sendVerification(user.email)
    } catch (error) {
        console.error(
            "Failed to load current user for email verification:",
            error,
        )
        return { error: t("verificationSendFailed") }
    }
}

export async function verifyMailAction(
    otp: string,
    accessToken?: string,
): Promise<VerificationActionState> {
    const t = await getTranslations("Auth.messages")
    const normalizedOtp = otp.replace(/\D/g, "")

    if (normalizedOtp.length !== 6) {
        return {
            error: t("verificationInvalid"),
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
                error: t("sessionExpired"),
            }
        }

        return {
            error: t("verificationInvalid"),
        }
    }

    return {}
}
