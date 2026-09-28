"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { resetPasswordAction } from "../api/reset-password"
import {
    type ResetPasswordFormValues,
    resetPasswordSchema,
} from "../schemas/reset-password"

export function useResetPassword() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
    const [isPending, startTransition] = useTransition()

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

        startTransition(async () => {
            try {
                await resetPasswordAction({
                    newPassword: data.newPassword,
                    confirmPassword: data.confirmPassword,
                })
            } catch {
                setServerError("Failed to reset password. Please try again.")
            }
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
