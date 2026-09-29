"use server"

import { ClientError } from "graphql-request"
import { redirect } from "next/navigation"

import { getGql, SignupDocument } from "@/gql"

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
        return { error: "Please fill in all fields." }
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." }
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
    } catch (error) {
        const errorMessage =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : ""

        const isUserExists =
            errorMessage.includes("userAlreadyExists") ||
            /(?:email.{0,40}(?:already|exist|registered|taken|in use)|(?:already|exist|registered|taken|in use).{0,40}email|duplicate.{0,40}email)/i.test(
                errorMessage,
            )

        if (isUserExists) {
            return {
                error: "This email is already taken. Please use a different one or log in.",
            }
        }

        return {
            error: "Failed to sign up. Please check your credentials or try again later.",
        }
    }

    await setTokens(tokens.accessToken, tokens.refreshToken)

    redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}
