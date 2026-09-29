"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { requestPasswordReset } from "../api/forgot-password"
import {
    type ForgotPasswordFormValues,
    forgotPasswordSchema,
} from "../schemas/forgot-password"

export function useForgotPassword() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
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
        resolver: zodResolver(forgotPasswordSchema),
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
                setSuccessMessage("Instructions have been sent to your email.")
            }
        })
    }

    return {
        isDarkMode,
        setIsDarkMode,
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
