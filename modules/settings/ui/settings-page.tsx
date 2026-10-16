"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { useSettings } from "../hooks/use-settings"

const SUPPORTED_LOCALES = [
    "en",
    "fr",
    "de",
    "it",
    "pl",
    "pt",
    "ru",
    "es",
    "uk",
] as const

const LANG_MAP: Record<string, string> = {
    en: "english",
    fr: "french",
    de: "german",
    it: "italian",
    pl: "polish",
    pt: "portuguese",
    ru: "russian",
    es: "spanish",
    uk: "ukrainian",
}

export function SettingsPage() {
    const t = useTranslations("Settings")
    const {
        locale,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
        setTheme,
        handleLanguageChange,
        watch,
    } = useSettings()

    const themeRegistration = register("theme")
    const languageRegistration = register("language")

    const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

    const passwordValue = watch("password")
    const newPasswordValue = watch("newPassword")
    const confirmPasswordValue = watch("confirmPassword")

    const hasPasswordValue = Boolean(passwordValue)
    const hasNewPasswordValue = Boolean(newPasswordValue)
    const hasConfirmPasswordValue = Boolean(confirmPasswordValue)

    const hasThemeValue = Boolean(selectedTheme)
    const hasLanguageValue = Boolean(locale)

    const themes = [
        { value: "Light", labelKey: "theme.light" },
        { value: "Dark", labelKey: "theme.dark" },
        { value: "Device settings", labelKey: "theme.deviceSettings" },
    ] as const

    const getThemeLabel = (val: string | null) => {
        if (!val) return t("theme.label")
        const item = themes.find((t) => t.value === val)
        return item ? t(item.labelKey) : val
    }

    const getLanguageLabel = (code: string) => {
        if (!code) return t("language.label")
        const key = LANG_MAP[code] || code
        const translationKey = `language.${key}` as const
        return t(translationKey as Parameters<typeof t>[0])
    }

    return (
        <main className="min-h-screen w-full bg-background text-foreground px-6 pt-4 pb-8 flex flex-col transition-colors duration-300">
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                >
                    <div className="relative w-full pt-4">
                        {hasThemeValue && (
                            <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                                {t("theme.label")}
                            </span>
                        )}
                        <Select
                            value={selectedTheme ?? ""}
                            onValueChange={(value) => {
                                setSelectedTheme(value)
                                if (value) {
                                    themeRegistration.onChange({
                                        target: {
                                            name: themeRegistration.name,
                                            value,
                                        },
                                    })
                                    if (value === "Dark") setTheme("dark")
                                    else if (value === "Light")
                                        setTheme("light")
                                    else setTheme("system")
                                }
                            }}
                        >
                            <SelectTrigger
                                className={cn(
                                    "w-full border px-4 py-6 text-sm shadow-none focus:ring-0 outline-none transition-colors",
                                    "rounded-none bg-[#F5F5F7] text-gray-800 border-[#D1D1D1]",
                                    "dark:bg-[#2E2E2E] dark:text-foreground dark:border-auth-card-border",
                                    !hasThemeValue && "text-muted-foreground",
                                )}
                            >
                                <div className="truncate">
                                    <SelectValue placeholder={t("theme.label")}>
                                        {selectedTheme
                                            ? getThemeLabel(selectedTheme)
                                            : undefined}
                                    </SelectValue>
                                </div>
                            </SelectTrigger>

                            <SelectContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                alignItemWithTrigger={false}
                                className={cn(
                                    "max-h-60 overflow-y-auto p-0 shadow-xl",
                                    "rounded-none border border-[#D1D1D1] bg-[#F5F5F7]",
                                    "dark:border-auth-card-border dark:bg-[#2E2E2E]",
                                )}
                            >
                                {themes.map((item) => {
                                    const isSelected =
                                        selectedTheme === item.value

                                    return (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                            className={cn(
                                                "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                                "[&_svg]:hidden pr-4",
                                                isSelected
                                                    ? "bg-button-secondary-defaultcondary-default text-[#F5F5F7]! **:text-[#F5F5F7]! focus:bg-button-secondary-default dark:bg-[#F5F5F7] dark:text-[#2E2E2E]! dark:**:text-[#2E2E2E]!"
                                                    : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-button-secondary-default dark:hover:bg-button-secondary-default",
                                            )}
                                        >
                                            {t(item.labelKey)}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative w-full pt-4">
                        {hasLanguageValue && (
                            <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                                {t("language.label")}
                            </span>
                        )}
                        <Select
                            value={locale}
                            onValueChange={(value) => {
                                if (value) {
                                    languageRegistration.onChange({
                                        target: {
                                            name: languageRegistration.name,
                                            value,
                                        },
                                    })
                                    handleLanguageChange(
                                        value as (typeof SUPPORTED_LOCALES)[number],
                                    )
                                }
                            }}
                        >
                            <SelectTrigger
                                className={cn(
                                    "w-full border px-4 py-6 text-sm shadow-none focus:ring-0 outline-none transition-colors",
                                    "rounded-none bg-[#F5F5F7] text-gray-800 border-[#D1D1D1]",
                                    "dark:bg-[#2E2E2E] dark:text-foreground dark:border-auth-card-border",
                                    !hasLanguageValue &&
                                        "text-muted-foreground",
                                )}
                            >
                                <div className="truncate">
                                    <SelectValue
                                        placeholder={t("language.label")}
                                    >
                                        {locale
                                            ? getLanguageLabel(locale)
                                            : undefined}
                                    </SelectValue>
                                </div>
                            </SelectTrigger>

                            <SelectContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                alignItemWithTrigger={false}
                                className={cn(
                                    "max-h-60 overflow-y-auto p-0 shadow-xl",
                                    "rounded-none border border-[#D1D1D1] bg-[#F5F5F7]",
                                    "dark:border-auth-card-border dark:bg-[#2E2E2E]",
                                )}
                            >
                                {SUPPORTED_LOCALES.map((langCode) => {
                                    const isSelected = locale === langCode

                                    return (
                                        <SelectItem
                                            key={langCode}
                                            value={langCode}
                                            className={cn(
                                                "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                                "[&_svg]:hidden pr-4",
                                                isSelected
                                                    ? "bg-button-secondary-default text-[#F5F5F7]! **:text-[#F5F5F7]! focus:bg-button-secondary-default dark:bg-[#F5F5F7] dark:text-[#2E2E2E]! dark:**:text-[#2E2E2E]!"
                                                    : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-button-secondary-default dark:hover:bg-button-secondary-default",
                                            )}
                                        >
                                            {getLanguageLabel(langCode)}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="pt-4 space-y-4">
                        <p className="text-sm font-medium">
                            {t("passwordSection.title")}
                        </p>

                        <div className="relative pt-4">
                            {hasPasswordValue && (
                                <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                                    {t("passwordSection.currentPlaceholder")}
                                </span>
                            )}
                            <PasswordField
                                label=""
                                placeholder={
                                    hasPasswordValue
                                        ? " "
                                        : t(
                                              "passwordSection.currentPlaceholder",
                                          )
                                }
                                error={errors.password?.message}
                                className="rounded-none bg-[#F5F5F7] dark:bg-[#2E2E2E]"
                                {...register("password")}
                            />
                        </div>

                        <div className="relative pt-4">
                            {hasNewPasswordValue && (
                                <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                                    {t("passwordSection.newPlaceholder")}
                                </span>
                            )}
                            <PasswordField
                                label=""
                                placeholder={
                                    hasNewPasswordValue
                                        ? " "
                                        : t("passwordSection.newPlaceholder")
                                }
                                error={errors.newPassword?.message}
                                className="rounded-none bg-[#F5F5F7] dark:bg-[#2E2E2E]"
                                {...register("newPassword")}
                            />
                        </div>

                        <div className="relative pt-4">
                            {hasConfirmPasswordValue && (
                                <span className="pointer-events-none absolute left-0 top-0 text-[11px] text-gray-500 dark:text-gray-400 transition-opacity">
                                    {t("passwordSection.confirmPlaceholder")}
                                </span>
                            )}
                            <PasswordField
                                label=""
                                placeholder={
                                    hasConfirmPasswordValue
                                        ? " "
                                        : t(
                                              "passwordSection.confirmPlaceholder",
                                          )
                                }
                                error={errors.confirmPassword?.message}
                                className="rounded-none bg-[#F5F5F7] dark:bg-[#2E2E2E]"
                                {...register("confirmPassword")}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!isValid || isPending}
                        >
                            {isPending
                                ? t("passwordSection.submittingButton")
                                : t("passwordSection.submitButton")}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    )
}
