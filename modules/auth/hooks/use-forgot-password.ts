"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { requestPasswordReset } from "../api/forgot-password"
import {
    createForgotPasswordSchema,
    type ForgotPasswordFormValues,
} from "../schemas/forgot-password"

export function useForgotPassword() {
    const validation = useTranslations("Auth.validation")
    const t = useTranslations("Auth.messages")
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(
            createForgotPasswordSchema({
                emailRequired: validation("emailRequired"),
                invalidEmail: validation("invalidEmail"),
            }),
        ),
        mode: "onChange",
    })

    const onSubmit = (data: ForgotPasswordFormValues) => {
        setServerError(undefined)
        setSuccessMessage(null)

        startTransition(async () => {
            const result = await requestPasswordReset(data.email)

            if (result?.error) {
                setServerError(result.error)
            } else {
                setSuccessMessage(t("forgotInstructionsSent"))
            }
        })
    }

    return {
        serverError,
        successMessage,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    }
}
