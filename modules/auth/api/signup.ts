"use server"

import { redirect } from "next/navigation"

import { getGql, LoginDocument, SignupDocument } from "@/gql"

import { setTokens } from "../helpers/tokens"
import type { AuthActionState } from "./login"

export async function signup(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (!email || !password || !confirmPassword) {
        return { error: "Заполните все поля." }
    }

    if (password !== confirmPassword) {
        return { error: "Пароли не совпадают." }
    }

    let tokens: { accessToken: string; refreshToken: string }
    const gql = await getGql()

    try {
        const data = await gql.request(SignupDocument, {
            auth: { email, password, confirmPassword },
        })

        tokens = {
            accessToken: data.signup.access_token,
            refreshToken: data.signup.refresh_token,
        }
    } catch {
        try {
            const data = await gql.request(LoginDocument, {
                auth: { email, password },
            })

            tokens = {
                accessToken: data.login.access_token,
                refreshToken: data.login.refresh_token,
            }
        } catch {
            return { error: "Не удалось зарегистрироваться. Проверьте данные." }
        }
    }

    await setTokens(tokens.accessToken, tokens.refreshToken)
    redirect("/")
}
