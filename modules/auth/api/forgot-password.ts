"use server"

import { ClientError } from "graphql-request"
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
        const message =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        return {
            error: message || t("forgotFailed"),
        }
    }
}
