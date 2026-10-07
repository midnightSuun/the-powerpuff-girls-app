"use server"

import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql, UpdateProfileDocument, UpdateUserProfileDocument } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import {
    type UpdateUserFormInput,
    updateUserSchema,
} from "../schemas/update-user"

export type { UpdateUserFormInput }

export async function updateUser(input: UpdateUserFormInput) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    const messages = await getTranslations("Users.messages")
    if (session.role !== "Admin") {
        return { success: false, error: messages("updateForbidden") }
    }

    const errors = await getTranslations("User.errors")
    const parsed = updateUserSchema({
        firstNameRequired: errors("firstNameRequired"),
        lastNameRequired: errors("lastNameRequired"),
        firstNameTooLong: errors("firstNameTooLong"),
        lastNameTooLong: errors("lastNameTooLong"),
        departmentRequired: errors("departmentRequired"),
        positionRequired: errors("positionRequired"),
        updateFailed: messages("updateFailed"),
    }).safeParse(input)

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? messages("updateFailed"),
        }
    }

    const { userId, firstName, lastName, departmentId, positionId, role } =
        parsed.data

    try {
        const gql = await getGql()

        await gql.request(UpdateProfileDocument, {
            profile: {
                userId,
                first_name: firstName,
                last_name: lastName,
            },
        })
        const data = await gql.request(UpdateUserProfileDocument, {
            user: {
                userId,
                departmentId,
                positionId,
                role,
            },
        })

        updateTag("users")

        return { success: true, data: data.updateUser }
    } catch (error) {
        console.error("Failed to update user:", error)
        return { success: false, error: messages("updateFailed") }
    }
}
