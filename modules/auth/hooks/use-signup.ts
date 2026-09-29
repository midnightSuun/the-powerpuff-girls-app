"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { type AuthActionState } from "../api/login"
import { signup } from "../api/signup"
import { type SignUpFormValues, signUpSchema } from "../schemas/signup"

export function useSignup() {
    const router = useRouter()
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange",
    })

    const onSubmit = (data: SignUpFormValues) => {
        setServerError(null)

        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)
            formData.append("password", data.password)
            formData.append("confirmPassword", data.confirmPassword)

            const initialState = {} as AuthActionState
            const result = await signup(initialState, formData)

            if (result?.error) {
                setServerError(result.error)
            } else if (result?.redirectTo) {
                router.push(result.redirectTo)
            }
        })
    }

    return {
        isDarkMode,
        setIsDarkMode,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    }
}
