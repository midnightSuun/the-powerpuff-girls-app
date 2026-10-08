"use server"

import { getTranslations } from "next-intl/server"

import { ForgotPasswordDocument, getGql } from "@/gql"

export async function requestPasswordReset(
    email: string,
): Promise<{ error?: string }> {
    const t = await getTranslations("Auth.messages")
    try {
        const gql = await getGql()
        await gql.request(ForgotPasswordDocument, { email: email.trim() })
        return {}
    } catch (error) {
        console.error("Password reset request failed:", error)
        return { error: t("forgotFailed") }
    }
}
