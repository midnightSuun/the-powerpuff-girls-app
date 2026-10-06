"use server"

import { ClientError } from "graphql-request"
import { getTranslations } from "next-intl/server"

import { getGql, LoginDocument, SignupDocument } from "@/gql"

import { setTokens } from "../helpers/tokens"
import type { AuthActionState } from "./login"

export async function signup(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<
    AuthActionState & {
        redirectTo?: string
        confirmationEmailSent?: boolean
    }
> {
    const t = await getTranslations("Auth.messages")
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")

    if (!email || !password || !confirmPassword) {
        return { error: t("signupRequired") }
    }

    if (password !== confirmPassword) {
        return { error: t("passwordsDoNotMatch") }
    }

    let tokens: { accessToken: string; refreshToken: string }
    let confirmationEmailSent = true
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
        console.error("🔴 FULL SIGNUP ERROR:", error)

        const errorMessage =
            error instanceof ClientError
                ? (error.response.errors
                      ?.map(({ message }) => message)
                      .join(" ") ?? "")
                : String(error)

        console.log("🔴 PARSED ERROR MESSAGE:", errorMessage)

        const isUserExists =
            errorMessage.includes("userAlreadyExists") ||
            /(?:email.{0,40}(?:already|exist|registered|taken|in use)|(?:already|exist|registered|taken|in use).{0,40}email|duplicate.{0,40}email)/i.test(
                errorMessage,
            )

        if (isUserExists) {
            return {
                error: t("emailAlreadyTaken"),
            }
        }

        if (errorMessage.includes("failedToSendEmail")) {
            confirmationEmailSent = false
            try {
                const loginData = await gql.request(LoginDocument, {
                    auth: { email, password },
                })

                tokens = {
                    accessToken: loginData.login.access_token,
                    refreshToken: loginData.login.refresh_token,
                }
            } catch (loginError) {
                console.error("🔴 LOGIN FALLBACK ERROR:", loginError)
                return {
                    error: t("signupEmailFailed"),
                }
            }
        } else {
            return {
                error: t("serverError", {
                    message: errorMessage || t("unknownError"),
                }),
            }
        }
    }

    await setTokens(tokens.accessToken, tokens.refreshToken)

    return {
        redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
        confirmationEmailSent,
    }
}
