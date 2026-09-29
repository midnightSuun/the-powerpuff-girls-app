"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"

import { getGql, ResetPasswordDocument } from "@/gql"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../consts"
import type { ResetPasswordFormValues } from "../schemas/reset-password"

export async function resetPasswordAction(
    data: ResetPasswordFormValues,
    token: string,
): Promise<{ error?: string }> {
    if (!token) {
        return { error: "Reset token is missing or invalid." }
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
                error: "This reset link has expired. Please request a new one.",
            }
        }

        return {
            error: message || "Failed to reset password. Please try again.",
        }
    }

    const cookieStore = await cookies()
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)

    return {}
}
