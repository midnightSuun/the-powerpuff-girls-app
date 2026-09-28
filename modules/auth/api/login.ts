"use server"

import { redirect } from "next/navigation"

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
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    if (!email || !password) {
        return { error: "Email and password are required." }
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
        return {
            error: "Failed to sign in. Please check your email and password.",
        }
    }

    await setTokens(tokens.accessToken, tokens.refreshToken)
    redirect("/")
}
