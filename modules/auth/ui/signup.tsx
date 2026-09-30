"use client"

import Link from "next/link"

import { PasswordField } from "@/components/password-field"
import { Button } from "@/components/ui/button"

import { useSignup } from "../hooks/use-signup"
import { AuthTabs } from "./components/authTabs"

export function Signup() {
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
                        Sign up now
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Welcome! Sign up to continue
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center space-y-6"
                    noValidate
                >
                    <div className="w-full space-y-1">
                        <input
                            type="email"
                            placeholder="Email"
                            aria-invalid={!!errors.email}
                            aria-describedby={
                                errors.email ? "email-error" : undefined
                            }
                            {...register("email")}
                            className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors text-foreground placeholder:text-muted-foreground ${
                                errors.email
                                    ? "border-destructive"
                                    : "border-input"
                            }`}
                        />
                        {errors.email && (
                            <span
                                id="email-error"
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <PasswordField
                        placeholder="Password"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <PasswordField
                        placeholder="Confirm Password"
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
                            disabled={!isValid || isPending}
                            className={`w-44 text-white transition-opacity ${
                                !isValid || isPending
                                    ? "bg-button-primary-default/50 cursor-not-allowed"
                                    : "bg-button-primary-default hover:bg-button-primary-default/90 cursor-pointer"
                            }`}
                        >
                            {isPending ? "CREATING..." : "CREATE ACCOUNT"}
                        </Button>

                        <Link
                            href="/login"
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                            I HAVE AN ACCOUNT
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}
