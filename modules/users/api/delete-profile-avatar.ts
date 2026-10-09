"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export async function deleteAvatar(input: { userId: string }) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    // Исправление: разрешаем удаление либо владельцу, либо Администратору (как в uploadProfileAvatar)
    if (session.userId !== String(input.userId) && session.role !== "Admin") {
        const t = await getTranslations("User.messages")
        return { success: false, error: t("updateForbidden") }
    }

    try {
        const gql = await getGql()
        await gql.request(
            `
            mutation DeleteAvatar($avatar: DeleteAvatarInput!) {
                deleteAvatar(avatar: $avatar)
            }
            `,
            {
                avatar: { userId: input.userId },
            },
        )

        revalidatePath("/[locale]/users/[userId]/profile", "page")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete avatar:", error)
        const t = await getTranslations("User.messages")
        return { success: false, error: t("updateFailed") }
    }
}
