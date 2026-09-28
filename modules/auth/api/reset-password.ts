"use server"

import { redirect } from "next/navigation"

import { getGql, ResetPasswordDocument } from "@/gql"

export async function resetPasswordAction(data: {
    newPassword: string
    confirmPassword: string
}) {
    if (!data.newPassword || !data.confirmPassword) {
        throw new Error("All fields are required")
    }

    if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords do not match")
    }

    const gql = await getGql()

    try {
        await gql.request(ResetPasswordDocument, {
            auth: {
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            },
        })
    } catch {
        throw new Error("Failed to reset password. Please try again.")
    }

    redirect("/login?reset=success")
}
