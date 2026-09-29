"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { type AuthActionState, login } from "../api/login"
import { type LoginFormData, loginSchema } from "../schemas/login"

export function useLogin() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
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
        resolver: zodResolver(loginSchema),
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
        isDarkMode,
        setIsDarkMode,
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
