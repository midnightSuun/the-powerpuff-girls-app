"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

import { useResetPassword } from "../hooks/use-reset-password"
import { PasswordField } from "./components/password-field"

export function ResetPasswordPage() {
    const {
        isDarkMode,
        setIsDarkMode,
        serverError,
        isPending,
        register,
        handleSubmit,
        onSubmit,
        errors,
        isValid,
    } = useResetPassword()

    return (
        <div
            className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative bg-background text-foreground ${
                isDarkMode ? "dark" : ""
            }`}
        >
            <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle color theme"
                className="absolute top-6 right-6 px-3 py-1.5 text-xs font-medium rounded border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
                Theme: {isDarkMode ? "Dark" : "Light"}
            </button>

            <div className="w-full max-w-125 px-6 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                        Reset password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Here you should write a new password and confirm it
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center space-y-6"
                    noValidate
                >
                    <div className="w-full space-y-1">
                        <PasswordField
                            placeholder="New password"
                            aria-invalid={!!errors.newPassword}
                            aria-describedby={
                                errors.newPassword
                                    ? "new-password-error"
                                    : undefined
                            }
                            error={errors.newPassword?.message}
                            {...register("newPassword")}
                            className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors pr-10 text-foreground placeholder:text-muted-foreground ${
                                errors.newPassword
                                    ? "border-destructive"
                                    : "border-input"
                            }`}
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
                            placeholder="Confirm password"
                            aria-invalid={!!errors.confirmPassword}
                            aria-describedby={
                                errors.confirmPassword
                                    ? "confirm-password-error"
                                    : undefined
                            }
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                            className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors pr-10 text-foreground placeholder:text-muted-foreground ${
                                errors.confirmPassword
                                    ? "border-destructive"
                                    : "border-input"
                            }`}
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
                            {isPending ? "SUBMITTING..." : "SUBMIT"}
                        </Button>

                        <Link
                            href="/login"
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                            GO TO SIGN IN
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
