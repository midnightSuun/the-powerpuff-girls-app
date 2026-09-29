"use server"

import { ClientError } from "graphql-request"

import { ForgotPasswordDocument, getGql } from "@/gql"

export async function requestPasswordReset(
    email: string,
): Promise<{ error?: string }> {
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
            error:
                message ||
                "Failed to send reset instructions. Please try again.",
        }
    }
}
