"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { updateSettingsPasswordAction } from "../api/update-password" // Импортируем отдельный серверный экшен
import { type SettingsFormValues, settingsSchema } from "../schemas/settings"

export function useSettings() {
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
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        mode: "onChange",
        defaultValues: {
            theme: "Device settings",
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
            // Вызываем созданный нами отдельный серверный экшен для настроек
            const result = await updateSettingsPasswordAction({
                password: data.password,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            })

            if (result?.error) {
                setServerError(result.error)
                return
            }

            setSuccessMessage("Password successfully updated.")
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
