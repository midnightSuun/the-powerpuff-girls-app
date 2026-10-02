"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"

import { GetCvDocument, getGql } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export async function getCvById(cvId: string) {
    const session = await getCurrentSession()
    if (!session) {
        return { error: "Your session has expired. Please log in again." }
    }

    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
        if (!token) {
            return { error: "Your session has expired. Please log in again." }
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
                error: "Your session has expired. Please log in again.",
            }
        }

        return {
            error: message || "Failed to fetch CV. Please try again.",
        }
    }
}
