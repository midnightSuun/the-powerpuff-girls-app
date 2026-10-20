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
    } catch (error: unknown) {
        console.error("Password reset request failed:", error)

        const err = error as {
            response?: {
                errors?: Array<{
                    message?: string
                    extensions?: { code?: string }
                }>
            }
            code?: string
            name?: string
            request?: { errors?: Array<{ extensions?: { code?: string } }> }
        }

        if (err?.response?.errors) {
            const graphqlError = err.response.errors[0]
            const errorMessage = graphqlError?.message?.toLowerCase() || ""
            const errorCode = graphqlError?.extensions?.code

            if (
                errorCode === "USER_NOT_FOUND" ||
                errorCode === "NOT_FOUND" ||
                errorMessage.includes("not found") ||
                errorMessage.includes("no account") ||
                errorMessage.includes("no user") ||
                errorMessage.includes("does not exist") ||
                errorMessage.includes("user does not exist")
            ) {
                return { error: t("forgotAccountNotFound") }
            }
        }

        if (
            err?.code === "NETWORK_ERROR" ||
            err?.name === "NetworkError" ||
            err?.request?.errors?.[0]?.extensions?.code === "NETWORK_ERROR"
        ) {
            return { error: t("forgotServerError") }
        }

        return { error: t("forgotServerError") }
    }
}
