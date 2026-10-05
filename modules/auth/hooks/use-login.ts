"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { type AuthActionState, login } from "../api/login"
import { createLoginSchema, type LoginFormData } from "../schemas/login"

export function useLogin() {
    const validation = useTranslations("Auth.validation")
    const [showPassword, setShowPassword] = useState(false)
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormData>({
        resolver: zodResolver(
            createLoginSchema({
                emailRequired: validation("emailRequired"),
                invalidEmail: validation("invalidEmail"),
                passwordRequired: validation("passwordRequired"),
                passwordMin: validation("passwordMin"),
            }),
        ),
        mode: "onChange",
    })

    const onSubmit = (data: LoginFormData) => {
        setServerError(undefined)

        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)
            formData.append("password", data.password)

            const initialState: AuthActionState = { error: undefined }
            const result = await login(initialState, formData)

            if (result?.error) {
                setServerError(result.error)
            }
        })
    }

    return {
        showPassword,
        setShowPassword,
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    }
}
