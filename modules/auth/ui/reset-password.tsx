"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

import { PasswordField } from "../../../components/password-field"
import { useResetPassword } from "../hooks/use-reset-password"

export function ResetPasswordPage() {
    const t = useTranslations("Auth.ResetPassword")
    const {
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    } = useResetPassword()

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative bg-background text-foreground">
            <div className="w-full max-w-125 px-6 flex flex-col items-center">
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
                    <PasswordField
                        label={t("newPasswordPlaceholder")}
                        placeholder={t("newPasswordPlaceholder")}
                        error={errors.newPassword?.message}
                        {...register("newPassword")}
                    />

                    <PasswordField
                        label={t("confirmPasswordPlaceholder")}
                        placeholder={t("confirmPasswordPlaceholder")}
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
                            {t("goToSignIn")}
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
