"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { getGql, UpdateCvDocument } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export async function updateCvAction(data: {
    cvId: string
    name: string
    education?: string
    description: string
}): Promise<{ error?: string }> {
    const t = await getTranslations("CV.list")
    const authMessages = await getTranslations("Auth.messages")
    const session = await getCurrentSession()
    if (!session) {
        return { error: authMessages("sessionExpired") }
    }

    if (
        !data.cvId ||
        !data.name?.trim() ||
        !data.education?.trim() ||
        !data.description?.trim()
    ) {
        return {
            error: "CV id, name, education, and description are required.",
        }
    }

    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
        if (!token) {
            return { error: authMessages("sessionExpired") }
        }

        const gql = await getGql(token)

        await gql.request(UpdateCvDocument, {
            cv: {
                cvId: data.cvId,
                name: data.name.trim(),
                education: data.education.trim(),
                description: data.description.trim(),
            },
        })
    } catch (error) {
        const message =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        if (/expired|unauthor/i.test(message)) {
            return {
                error: authMessages("sessionExpired"),
            }
        }

        console.error("Failed to update CV:", error)
        return { error: t("updateError") }
    }

    return {}
}
