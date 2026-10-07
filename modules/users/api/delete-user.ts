"use server"

import { ClientError } from "graphql-request"
import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"

import { DeleteUserDocument, getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export async function deleteUser(userId: string) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    const messages = await getTranslations("Users.messages")
    if (session.role !== "Admin") {
        return { success: false, error: messages("deleteForbidden") }
    }

    if (session.userId === userId) {
        return { success: false, error: messages("deleteSelfForbidden") }
    }

    try {
        const gql = await getGql()
        const data = await gql.request(DeleteUserDocument, { userId })

        if (data.deleteUser.affected === 0) {
            return { success: false, error: messages("deleteFailed") }
        }

        updateTag("users")
        return { success: true }
    } catch (error) {
        const message =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        console.error("Failed to delete user:", message.split("\n")[0])
        return { success: false, error: messages("deleteFailed") }
    }
}
