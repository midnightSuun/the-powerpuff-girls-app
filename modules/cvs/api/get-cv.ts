"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { GetCvDocument, getGql } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export async function getCvById(cvId: string) {
    const t = await getTranslations("CV.list")
    const authMessages = await getTranslations("Auth.messages")
    const session = await getCurrentSession()
    if (!session) {
        return { error: authMessages("sessionExpired") }
    }

    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
        if (!token) {
            return { error: authMessages("sessionExpired") }
        }

        const gql = await getGql(token)

        const data = await gql.request(GetCvDocument, { cvId })
        return { data: data.cv }
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

        console.error("Failed to fetch CV:", error)
        return { error: t("fetchError") }
    }
}
