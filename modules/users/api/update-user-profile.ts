"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql, GetUserDocument, UpdateUserProfileDocument } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export type UpdateUserProfileInput = {
    userId: string
    departmentId: string
    positionId: string
}

export async function updateUserProfile(input: UpdateUserProfileInput) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    if (session.userId !== String(input.userId)) {
        const t = await getTranslations("User.messages")
        return { success: false, error: t("updateForbidden") }
    }

    const errors = await getTranslations("User.errors")
    if (!input.departmentId) {
        return { success: false, error: errors("departmentRequired") }
    }
    if (!input.positionId) {
        return { success: false, error: errors("positionRequired") }
    }

    try {
        const gql = await getGql()
        const targetUser = await gql.request(GetUserDocument, {
            id: input.userId,
        })
        const data = await gql.request(UpdateUserProfileDocument, {
            user: {
                userId: input.userId,
                departmentId: input.departmentId,
                positionId: input.positionId,
                role: targetUser.user.role,
            },
        })

        revalidatePath("/[locale]/users/[userId]/profile", "page")

        return { success: true, data: data.updateUser }
    } catch (error) {
        console.error("Failed to update user profile assignments:", error)
        const t = await getTranslations("User.messages")
        return {
            success: false,
            error: t("updateFailed"),
        }
    }
}
