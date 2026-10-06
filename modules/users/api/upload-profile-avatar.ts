"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql, UploadAvatarDocument } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/gif"])

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
                base64,
                size: file.size,
                type: file.type,
            },
        })

        revalidatePath("/[locale]/users/[userId]/profile", "page")

        return { success: true, data: data.uploadAvatar }
    } catch (error) {
        console.error("Failed to upload user profile avatar:", error)
        const t = await getTranslations("User.messages")
        return {
            success: false,
            error: t("avatarUploadFailed"),
        }
    }
}
