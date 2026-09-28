"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"

import { type AuthActionState } from "../api/login"
import { signup } from "../api/signup"
import { type SignUpFormValues, signUpSchema } from "../schemas/signup"
import { AuthTabs } from "./components/authTabs"

export function Signup() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange",
    })

    const onSubmit = (data: SignUpFormValues) => {
        setServerError(null)

        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)
            formData.append("password", data.password)
            formData.append("confirmPassword", data.confirmPassword)

            const initialState = {} as AuthActionState
            const result = await signup(initialState, formData)

            if (result?.error) {
                setServerError(result.error)
            }
        })
    }

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

            <AuthTabs activeTab="signup" isDarkMode={isDarkMode} />

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

                    <div className="w-full relative space-y-1">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                aria-invalid={!!errors.password}
                                aria-describedby={
                                    errors.password
                                        ? "password-error"
                                        : undefined
                                }
                                {...register("password")}
                                className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors pr-12 text-foreground placeholder:text-muted-foreground ${
                                    errors.password
                                        ? "border-destructive"
                                        : "border-input"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {showPassword ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                        {errors.password && (
                            <span
                                id="password-error"
                                className="text-xs text-destructive"
                                role="alert"
                            >
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    <div className="w-full relative space-y-1">
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                aria-invalid={!!errors.confirmPassword}
                                aria-describedby={
                                    errors.confirmPassword
                                        ? "confirm-password-error"
                                        : undefined
                                }
                                {...register("confirmPassword")}
                                className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors pr-12 text-foreground placeholder:text-muted-foreground ${
                                    errors.confirmPassword
                                        ? "border-destructive"
                                        : "border-input"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {showConfirmPassword ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
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
        </div>
    )
}
