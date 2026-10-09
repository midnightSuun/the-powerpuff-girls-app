"use client"

import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"

import { useSettings } from "../hooks/use-settings"

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
    } = useSettings()

    const themeRegistration = register("theme")
    const languageRegistration = register("language")

    return (
        <main className="min-h-screen w-full bg-background text-foreground px-6 pt-4 pb-8 flex flex-col transition-colors duration-300">
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                >
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground block">
                            {t("theme.label")}
                        </label>
                        <div className="relative">
                            <select
                                {...themeRegistration}
                                onChange={(e) => {
                                    themeRegistration.onChange(e)
                                    const value = e.target.value
                                    if (value === "Dark") setTheme("dark")
                                    else if (value === "Light")
                                        setTheme("light")
                                    else setTheme("system")
                                }}
                                className="w-full h-11 px-4 pr-10 text-sm bg-transparent border border-border rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-foreground"
                            >
                                <option
                                    value="Light"
                                    className="bg-background text-foreground"
                                >
                                    {t("theme.light")}
                                </option>
                                <option
                                    value="Dark"
                                    className="bg-background text-foreground"
                                >
                                    {t("theme.dark")}
                                </option>
                                <option
                                    value="Device settings"
                                    className="bg-background text-foreground"
                                >
                                    {t("theme.deviceSettings")}
                                </option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground block">
                            {t("language.label")}
                        </label>
                        <div className="relative">
                            <select
                                {...languageRegistration}
                                value={locale}
                                onChange={(e) => {
                                    languageRegistration.onChange(e)
                                    handleLanguageChange(
                                        e.target.value as
                                            | "en"
                                            | "fr"
                                            | "de"
                                            | "it"
                                            | "pl"
                                            | "pt"
                                            | "ru"
                                            | "es"
                                            | "uk",
                                    )
                                }}
                                className="w-full h-11 px-4 pr-10 text-sm bg-transparent border border-border rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer text-foreground"
                            >
                                <option
                                    value="en"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.english")}
                                </option>
                                <option
                                    value="fr"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.french")}
                                </option>
                                <option
                                    value="de"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.german")}
                                </option>
                                <option
                                    value="it"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.italian")}
                                </option>
                                <option
                                    value="pl"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.polish")}
                                </option>
                                <option
                                    value="pt"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.portuguese")}
                                </option>
                                <option
                                    value="ru"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.russian")}
                                </option>
                                <option
                                    value="es"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.spanish")}
                                </option>
                                <option
                                    value="uk"
                                    className="bg-background text-foreground"
                                >
                                    {t("language.ukrainian")}
                                </option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <p className="text-sm font-medium">
                            {t("passwordSection.title")}
                        </p>

                        <div className="space-y-1">
                            <PasswordField
                                label={t("passwordSection.currentPlaceholder")}
                                placeholder={t(
                                    "passwordSection.currentPlaceholder",
                                )}
                                error={errors.password?.message}
                                {...register("password")}
                            />
                        </div>

                        <div className="space-y-1">
                            <PasswordField
                                label={t("passwordSection.newPlaceholder")}
                                placeholder={t(
                                    "passwordSection.newPlaceholder",
                                )}
                                error={errors.newPassword?.message}
                                {...register("newPassword")}
                            />
                        </div>

                        <div className="space-y-1">
                            <PasswordField
                                label={t("passwordSection.confirmPlaceholder")}
                                placeholder={t(
                                    "passwordSection.confirmPlaceholder",
                                )}
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            disabled={!isValid || isPending}
                            className={`w-32 text-white font-medium text-xs tracking-wider uppercase transition-colors ${
                                !isValid || isPending
                                    ? "bg-button-primary-default/50 cursor-not-allowed"
                                    : "bg-button-primary-default hover:bg-button-primary-default/90 cursor-pointer"
                            }`}
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
