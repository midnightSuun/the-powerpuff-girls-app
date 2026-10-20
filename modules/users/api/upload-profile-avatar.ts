"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql, UploadAvatarDocument } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from "../constants"

export async function uploadProfileAvatar(formData: FormData) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    const userId = formData.get("userId") as string
    const file = formData.get("file") as File

    if (!userId || !file) {
        const t = await getTranslations("User.messages")
        return { success: false, error: t("avatarUploadFailed") }
    }

    if (session.userId !== userId && session.role !== "Admin") {
        const t = await getTranslations("User.messages")
        return { success: false, error: t("updateForbidden") }
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        const t = await getTranslations("User.errors")
        return { success: false, error: t("unsupportedFileType") }
    }

    if (file.size > MAX_AVATAR_SIZE) {
        const t = await getTranslations("User.errors")
        return { success: false, error: t("fileTooLarge") }
    }

    try {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString("base64")

        const gql = await getGql()
        const data = await gql.request(UploadAvatarDocument, {
            avatar: {
                userId,
                base64: `data:${file.type};base64,${base64}`,
                size: file.size,
                type: file.type,
            },
        })

        revalidatePath("/[locale]/users/[userId]/profile", "page")

        return { success: true, data: data.uploadAvatar }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error(
            "Failed to upload user profile avatar:",
            message.split("\n")[0]?.slice(0, 300),
        )
        const t = await getTranslations("User.messages")
        return {
            success: false,
            error: t("avatarUploadFailed"),
        }
    }
}
