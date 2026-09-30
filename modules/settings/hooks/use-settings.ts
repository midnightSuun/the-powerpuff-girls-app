"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTheme } from "next-themes"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { updateSettingsPasswordAction } from "../api/update-password"
import { type SettingsFormValues, settingsSchema } from "../schemas/settings"

export function useSettings() {
    const { theme } = useTheme()
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const getInitialTheme = () => {
        if (theme === "dark") return "Dark"
        if (theme === "light") return "Light"
        return "Device settings"
    }

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        mode: "onChange",
        defaultValues: {
            theme: getInitialTheme(),
            language: "English",
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (data: SettingsFormValues) => {
        setServerError(undefined)
        setSuccessMessage(null)

        startTransition(async () => {
            const result = await updateSettingsPasswordAction({
                password: data.password,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            })

            if (result?.error) {
                setServerError(result.error)
                return
            }

            setSuccessMessage("Settings and password successfully updated.")
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
