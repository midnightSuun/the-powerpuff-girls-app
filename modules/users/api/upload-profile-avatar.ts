"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql, UploadAvatarDocument } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

const MAX_AVATAR_SIZE = 500_000
const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/gif"])
const BASE64_PATTERN =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

export type UploadProfileAvatarInput = {
    userId: string
    base64: string
    size: number
    type: string
}

export async function uploadProfileAvatar(input: UploadProfileAvatarInput) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    if (session.userId !== String(input.userId)) {
        const t = await getTranslations("User.messages")
        return { success: false, error: t("updateForbidden") }
    }

    if (!ALLOWED_AVATAR_TYPES.has(input.type)) {
        const t = await getTranslations("User.errors")
        return { success: false, error: t("unsupportedFileType") }
    }

    if (
        !Number.isInteger(input.size) ||
        input.size <= 0 ||
        input.size > MAX_AVATAR_SIZE
    ) {
        const t = await getTranslations("User.errors")
        return { success: false, error: t("fileTooLarge") }
    }

    if (
        !BASE64_PATTERN.test(input.base64) ||
        Buffer.byteLength(input.base64, "base64") !== input.size
    ) {
        const t = await getTranslations("User.messages")
        return { success: false, error: t("avatarUploadFailed") }
    }

    try {
        const gql = await getGql()
        const data = await gql.request(UploadAvatarDocument, {
            avatar: {
                userId: input.userId,
                base64: `data:${input.type};base64,${input.base64}`,
                size: input.size,
                type: input.type,
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
