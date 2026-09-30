"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { resetPasswordAction } from "../api/reset-password"
import {
    type ResetPasswordFormValues,
    resetPasswordSchema,
} from "../schemas/reset-password"

export function useResetPassword() {
    const router = useRouter()
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const token = searchParams.get("token") || undefined

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
    })

    const onSubmit = (data: ResetPasswordFormValues) => {
        setServerError(undefined)

        if (!token) {
            setServerError(
                "Reset token is missing or invalid. Open the link from your email again.",
            )
            return
        }

        startTransition(async () => {
            const result = await resetPasswordAction(
                {
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                },
                token,
            )

            if (result.error) {
                setServerError(result.error)
                return
            }

            router.push("/login?reset=success")
        })
    }

    return {
        isDarkMode,
        setIsDarkMode,
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    }
}
