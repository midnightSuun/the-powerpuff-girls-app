"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useLogin } from "../hooks/use-login"
import { AuthTabs } from "./components/authTabs"

export function Login() {
    const t = useTranslations("Auth.Login")
    const {
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    } = useLogin()

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative bg-background text-foreground">
            <AuthTabs activeTab="signin" />

            <div className="w-full max-w-md px-6 flex flex-col items-center mt-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center space-y-8"
                    noValidate
                >
                    <div className="w-full">
                        <Input
                            type="email"
                            label={t("emailPlaceholder")}
                            error={errors.email?.message}
                            aria-invalid={!!errors.email}
                            autoComplete="email"
                            {...register("email")}
                        />
                    </div>

                    <div className="w-full">
                        <PasswordField
                            type="password"
                            label={t("passwordPlaceholder")}
                            placeholder={t("passwordPlaceholder")}
                            error={errors.password?.message}
                            aria-invalid={!!errors.password}
                            autoComplete="current-password"
                            {...register("password")}
                        />
                    </div>

                    {serverError && (
                        <p
                            className="text-xs text-destructive text-center w-full"
                            role="alert"
                        >
                            {serverError}
                        </p>
                    )}

                    <div className="w-full flex flex-col items-center pt-2 space-y-6">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!isValid || isPending}
                        >
                            {isPending
                                ? t("submittingButton")
                                : t("submitButton")}
                        </Button>

                        <Link
                            href="/forgot-password"
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                        >
                            {t("forgotPassword")}
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
