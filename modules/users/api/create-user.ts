"use server"

import { ClientError } from "graphql-request"
import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"

import type { CreateUserInput } from "@/gql"
import { CreateUserDocument, getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import {
    type CreateUserFormInput,
    createUserSchema,
} from "../schemas/create-user"

export type { CreateUserFormInput }

const isEmailTaken = (message: string) => {
    return (
        message.includes("userAlreadyExists") ||
        /(?:email.{0,40}(?:already|exist|registered|taken|in use)|(?:already|exist|registered|taken|in use).{0,40}email|duplicate.{0,40}email)/i.test(
            message,
        )
    )
}

export async function createUser(input: CreateUserFormInput) {
    const session = await getCurrentSession()
    if (!session) {
        const t = await getTranslations("Auth.messages")
        return { success: false, error: t("sessionExpired") }
    }

    const messages = await getTranslations("Users.messages")
    if (session.role !== "Admin") {
        return { success: false, error: messages("createForbidden") }
    }

    const validation = await getTranslations("Auth.validation")
    const errors = await getTranslations("User.errors")
    const parsed = createUserSchema({
        emailRequired: validation("emailRequired"),
        invalidEmail: validation("invalidEmail"),
        passwordRequired: validation("passwordRequired"),
        passwordMin: validation("passwordMin"),
        firstNameRequired: errors("firstNameRequired"),
        lastNameRequired: errors("lastNameRequired"),
        firstNameTooLong: errors("firstNameTooLong"),
        lastNameTooLong: errors("lastNameTooLong"),
        createFailed: messages("createFailed"),
    }).safeParse(input)

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? messages("createFailed"),
        }
    }

    const {
        email,
        password,
        firstName,
        lastName,
        departmentId,
        positionId,
        role,
    } = parsed.data
    const user: CreateUserInput = {
        auth: { email, password },
        profile: {
            first_name: firstName,
            last_name: lastName,
        },
        role,
        ...(departmentId ? { departmentId } : {}),
        ...(positionId ? { positionId } : {}),
    }

    try {
        const gql = await getGql()
        const data = await gql.request(CreateUserDocument, { user })

        updateTag("users")

        return { success: true, data: data.createUser }
    } catch (error) {
        const errorMessage =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : error instanceof Error
                  ? error.message
                  : ""

        console.error(
            "Failed to create user:",
            errorMessage.split("\n")[0]?.slice(0, 300),
        )

        if (isEmailTaken(errorMessage)) {
            const auth = await getTranslations("Auth.messages")
            return { success: false, error: auth("emailAlreadyTaken") }
        }

        return { success: false, error: messages("createFailed") }
    }
}
