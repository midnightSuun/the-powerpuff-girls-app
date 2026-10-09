"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { getGql, ResetPasswordDocument } from "@/gql"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../consts"
import type { ResetPasswordFormValues } from "../schemas/reset-password"

export async function resetPasswordAction(
    data: ResetPasswordFormValues,
    token: string,
): Promise<{ error?: string }> {
    const t = await getTranslations("Auth.messages")
    if (!token) {
        return { error: t("resetTokenInvalid") }
    }

    try {
        const gql = await getGql(token)
        await gql.request(ResetPasswordDocument, {
            auth: {
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            },
        })
    } catch (error) {
        const message =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        if (/expired|unauthor/i.test(message)) {
            return {
                error: t("resetExpired"),
            }
        }

        console.error("Password reset failed:", error)
        return { error: t("resetFailed") }
    }

    const cookieStore = await cookies()
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)

    return {}
}
