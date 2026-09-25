"use server"

import { redirect } from "next/navigation"

import { getGql, LoginDocument } from "@/gql"

import { setTokens } from "../helpers/tokens"

export type AuthActionState = {
    error?: string
}

export async function login(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (!email || !password) {
        return { error: "Введите email и пароль." }
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
    } catch {
        return { error: "Не удалось войти. Проверьте email и пароль." }
    }

    await setTokens(tokens.accessToken, tokens.refreshToken)
    redirect("/")
}
