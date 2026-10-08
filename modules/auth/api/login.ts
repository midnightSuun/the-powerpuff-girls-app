"use server"

import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getGql, LoginDocument } from "@/gql"

import { setTokens } from "../helpers/tokens"

export type AuthActionState = {
    error?: string
    field?: string
}

export async function login(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const t = await getTranslations("Auth.messages")
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (!email || !password) {
        return { error: t("loginRequired") }
    }

    let tokens: { accessToken: string; refreshToken: string }

    try {
        const gql = await getGql()
        const data = await gql.request(LoginDocument, {
            auth: { email, password },
        })

        tokens = {
            accessToken: data.login.access_token,
            refreshToken: data.login.refresh_token,
        }
    } catch (error) {
        console.error("Login failed:", error)
        return {
            error: t("loginFailed"),
        }
    }

    await setTokens(tokens.accessToken, tokens.refreshToken)

    redirect("/")
}
