import { ClientError } from "graphql-request"
import { cookies } from "next/headers"

import {
    GetAdminCvsDocument,
    getGql,
    GetUserCvsDocument,
    SearchPaginationInput,
} from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

export async function getAdminCvs(params?: SearchPaginationInput) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || ""

        const gql = await getGql(token)

        const data = await gql.request(GetAdminCvsDocument, { params })

        return data.cvs
    } catch (error) {
        const message =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        if (/expired|unauthor/i.test(message)) {
            throw new Error("Your session has expired. Please log in again.")
        }

        console.error("Failed to fetch admin CVs:", message || error)
        throw new Error("Failed to fetch admin CVs.")
    }
}

export async function getUserCvs(
    userId: string,
    params?: SearchPaginationInput,
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || ""

        const gql = await getGql(token)

        const data = await gql.request(GetUserCvsDocument, { userId, params })
        return data.cvsByUserId
    } catch (error) {
        const message =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        if (/expired|unauthor/i.test(message)) {
            throw new Error("Your session has expired. Please log in again.")
        }

        console.error("Failed to fetch user CVs:", message || error)
        throw new Error("Failed to fetch user CVs.")
    }
}
