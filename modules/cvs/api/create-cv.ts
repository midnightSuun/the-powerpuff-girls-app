"use server"

import { ClientError } from "graphql-request"
import { cookies } from "next/headers"

import { CreateCvDocument, getGql } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

export async function createCvAction(data: {
    name: string
    education?: string
    description: string
    userId?: string
}): Promise<{ error?: string }> {
    const session = await getCurrentSession()
    if (!session) {
        return { error: "Your session has expired. Please log in again." }
    }

    if (
        data.userId !== undefined &&
        (typeof data.userId !== "string" || !data.userId.trim())
    ) {
        return { error: "User id is required." }
    }

    const userId = data.userId?.trim() ?? session.userId
    if (userId !== session.userId && session.role !== "Admin") {
        return { error: "You can only create CVs for yourself." }
    }

    if (
        !data.name?.trim() ||
        !data.education?.trim() ||
        !data.description?.trim()
    ) {
        return { error: "Name, education, and description are required." }
    }

    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
        if (!token) {
            return { error: "Your session has expired. Please log in again." }
        }

        const gql = await getGql(token)

        await gql.request(CreateCvDocument, {
            cv: {
                name: data.name.trim(),
                education: data.education.trim(),
                description: data.description.trim(),
                userId,
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
                error: "Your session has expired. Please log in again.",
            }
        }

        return {
            error: message || "Failed to create CV. Please try again.",
        }
    }

    return {}
}
