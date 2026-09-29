"use server"

import { redirect } from "next/navigation"

import { ForgotPasswordDocument, getGql } from "@/gql"

import type { AuthActionState } from "./login"

export async function requestPasswordReset(
    _previousState: AuthActionState,
    formData: FormData,
): Promise<AuthActionState> {
    const email = String(formData.get("email") ?? "").trim()

    if (!email) {
        return { error: "Email is required" }
    }

    const gql = await getGql()

    try {
        await gql.request(ForgotPasswordDocument, {
            email,
        })
    } catch {
        return {
            error: "Failed to send reset instructions. Please check your email and try again.",
        }
    }

    redirect("/login?reset=sent")
}
