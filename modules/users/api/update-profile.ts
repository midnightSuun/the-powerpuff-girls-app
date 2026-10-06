"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import type { UpdateProfileInput as GqlUpdateProfileInput } from "@/gql"
import { getGql, UpdateProfileDocument } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export type UpdateProfileInput = {
    userId: GqlUpdateProfileInput["userId"]
    first_name: string
    last_name: string
}

export async function updateProfile(input: UpdateProfileInput) {
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
    const firstName = input.first_name.trim()
    const lastName = input.last_name.trim()
    if (!firstName) {
        return { success: false, error: errors("firstNameRequired") }
    }
    if (!lastName) {
        return { success: false, error: errors("lastNameRequired") }
    }
    if (input.first_name.length > 100) {
        return { success: false, error: errors("firstNameTooLong") }
    }
    if (input.last_name.length > 100) {
        return { success: false, error: errors("lastNameTooLong") }
    }

    try {
        const gql = await getGql()

        const data = await gql.request(UpdateProfileDocument, {
            profile: {
                ...input,
                first_name: firstName,
                last_name: lastName,
            },
        })

        revalidatePath("/[locale]/users/[userId]/profile", "page")

        return {
            success: true,
            data: data.updateProfile,
        }
    } catch (error) {
        console.error("Failed to update profile:", error)
        const t = await getTranslations("User.messages")
        return {
            success: false,
            error: t("updateFailed"),
        }
    }
}
