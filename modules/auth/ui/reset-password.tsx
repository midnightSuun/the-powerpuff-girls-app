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
                    <div className="w-full space-y-1">
                        <PasswordField
                            placeholder={t("newPasswordPlaceholder")}
                            aria-invalid={!!errors.newPassword}
                            aria-describedby={
                                errors.newPassword
                                    ? "new-password-error"
                                    : undefined
                            }
                            error={errors.newPassword?.message}
                            {...register("newPassword")}
                        />
                        {errors.newPassword && (
                            <span
                                id="new-password-error"
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {errors.newPassword.message}
                            </span>
                        )}
                    </div>

                    <div className="w-full space-y-1">
                        <PasswordField
                            placeholder={t("confirmPasswordPlaceholder")}
                            aria-invalid={!!errors.confirmPassword}
                            aria-describedby={
                                errors.confirmPassword
                                    ? "confirm-password-error"
                                    : undefined
                            }
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <span
                                id="confirm-password-error"
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {errors.confirmPassword.message}
                            </span>
                        )}
                    </div>

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
                            disabled={!isValid || isPending}
                            className={`w-40 text-white transition-opacity ${
                                !isValid || isPending
                                    ? "bg-button-primary-default/50 cursor-not-allowed"
                                    : "bg-button-primary-default hover:bg-button-primary-default/90 cursor-pointer"
                            }`}
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
