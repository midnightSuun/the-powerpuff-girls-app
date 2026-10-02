"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { usePathname, useRouter } from "@/i18n/navigation"

import { updateSettingsPasswordAction } from "../api/update-password"
import {
    createSettingsSchema,
    type SettingsFormValues,
} from "../schemas/settings"

export function useSettings() {
    const validation = useTranslations("Settings.validation")
    const t = useTranslations("Settings.messages")
    const { theme, setTheme } = useTheme()
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

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
        resolver: zodResolver(
            createSettingsSchema({
                passwordRequired: validation("passwordRequired"),
                newPasswordRequired: validation("newPasswordRequired"),
                confirmPasswordRequired: validation("confirmPasswordRequired"),
                passwordsDoNotMatch: validation("passwordsDoNotMatch"),
            }),
        ),
        mode: "onChange",
        defaultValues: {
            theme: getInitialTheme(),
            language: locale,
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const handleLanguageChange = (newLocale: "en" | "ru") => {
        router.replace(pathname, { locale: newLocale })
    }

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

            setSuccessMessage(t("updated"))
        })
    }

    return {
        locale,
        serverError,
        successMessage,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
        setTheme,
        handleLanguageChange,
    }
}
