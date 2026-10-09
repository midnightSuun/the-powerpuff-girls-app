"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useSignup } from "../hooks/use-signup"
import { AuthTabs } from "./components/authTabs"

export function Signup() {
    const t = useTranslations("Auth.Signup")
    const {
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    } = useSignup()

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative bg-background text-foreground">
            <AuthTabs activeTab="signup" />

            <div className="w-full max-w-125 px-6 flex flex-col items-center mt-12">
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
                    className="w-full flex flex-col items-center space-y-6"
                    noValidate
                >
                    <div className="w-full space-y-1">
                        <Input
                            type="email"
                            label={t("emailPlaceholder")}
                            error={errors.email?.message}
                            aria-invalid={!!errors.email}
                            {...register("email")}
                        />
                    </div>

                    <PasswordField
                        label={t("passwordPlaceholder")}
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <PasswordField
                        label={t("confirmPasswordPlaceholder")}
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword")}
                    />

                    {serverError && (
                        <p
                            className="text-xs text-destructive text-center w-full"
                            role="alert"
                        >
                            {serverError}
                        </p>
                    )}

                    <div className="w-full flex flex-col items-center pt-6 space-y-6">
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
                            href="/login"
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t("haveAccount")}
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
