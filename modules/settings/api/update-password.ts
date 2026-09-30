"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"

import { ChangePasswordDocument, getGql } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

import type { SettingsFormValues } from "../schemas/settings"

export async function updateSettingsPasswordAction(
    data: Pick<
        SettingsFormValues,
        "password" | "newPassword" | "confirmPassword"
    >,
): Promise<{ error?: string }> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || ""

        const gql = await getGql(token)

        await gql.request(ChangePasswordDocument, {
            args: {
                oldPassword: data.password,
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
                error: "Your session has expired. Please log in again.",
            }
        }

        return {
            error:
                message ||
                "Failed to update password. Please check your current password.",
        }
    }

    return {}
}
