"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { resetPasswordAction } from "../api/reset-password"
import {
    createResetPasswordSchema,
    type ResetPasswordFormValues,
} from "../schemas/reset-password"

export function useResetPassword() {
    const validation = useTranslations("Auth.validation")
    const t = useTranslations("Auth.messages")
    const router = useRouter()
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
        resolver: zodResolver(
            createResetPasswordSchema({
                passwordRequired: validation("passwordRequired"),
                passwordMin: validation("passwordMin8"),
                confirmPassword: validation("confirmPassword"),
                passwordsDoNotMatch: validation("passwordsDoNotMatch"),
            }),
        ),
        mode: "onChange",
    })

    const onSubmit = (data: ResetPasswordFormValues) => {
        setServerError(undefined)

        if (!token) {
            setServerError(t("resetTokenInvalid"))
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
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    }
}
