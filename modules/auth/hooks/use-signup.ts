"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { type AuthActionState } from "../api/login"
import { signup } from "../api/signup"
import { createSignUpSchema, type SignUpFormValues } from "../schemas/signup"

export function useSignup() {
    const validation = useTranslations("Auth.validation")
    const messages = useTranslations("Auth.messages")
    const notifications = useTranslations("Notifications")
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(
            createSignUpSchema({
                emailRequired: validation("emailRequired"),
                invalidEmail: validation("invalidEmail"),
                passwordRequired: validation("passwordRequired"),
                passwordMin: validation("passwordMin"),
                confirmPassword: validation("confirmPassword"),
                passwordsDoNotMatch: validation("passwordsDoNotMatch"),
            }),
        ),
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
                if (result.confirmationEmailSent) {
                    toast.success(notifications("success"), {
                        description: messages("signupVerificationSent"),
                        closeButton: true,
                    })
                } else {
                    toast.error(notifications("error"), {
                        description: messages("signupEmailFailed"),
                        closeButton: true,
                    })
                }
                router.push(result.redirectTo)
            }
        })
    }

    return {
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
