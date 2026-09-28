"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { requestPasswordReset } from "../api/forgot-password"
import type { AuthActionState } from "../api/login"
import {
    type ForgotPasswordFormValues,
    forgotPasswordSchema,
} from "../schemas/forgot-password"

export function useForgotPassword() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
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

        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)

            const initialState: AuthActionState = { error: undefined }
            const result = await requestPasswordReset(initialState, formData)

            if (result?.error) {
                setServerError(result.error)
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
