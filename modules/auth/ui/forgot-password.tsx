"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"

import { requestPasswordReset } from "../api/forgot-password"
import type { AuthActionState } from "../api/login"
import {
    type ForgotPasswordFormValues,
    forgotPasswordSchema,
} from "../schemas/forgot-password"

export function ForgotPasswordPage() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | undefined>(
        undefined,
    )
    const [isPending, startTransition] = useTransition()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange",
    })

    const onSubmit = (data: ForgotPasswordFormValues) => {
        setServerError(undefined)

        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)

            const initialState: AuthActionState = { error: undefined }
            const result = await requestPasswordReset(initialState, formData)

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
                className="absolute top-6 right-6 px-3 py-1.5 text-xs font-medium rounded border border-auth-card-border text-foreground hover:bg-muted transition-colors"
            >
                Theme: {isDarkMode ? "Dark" : "Light"}
            </button>

            <div className="w-full max-w-125 px-6 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-3xl tracking-tight mb-2">
                        Forgot password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        We will send you an email with further instructions
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center space-y-6"
                >
                    <div className="w-full space-y-1">
                        <label
                            htmlFor="email"
                            className="block text-xs uppercase tracking-wider text-muted-foreground"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            {...register("email")}
                            className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-muted-foreground ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-auth-card-border"
                            }`}
                        />
                        {errors.email && (
                            <span className="text-xs text-red-400">
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    {serverError && (
                        <p
                            className="text-xs text-red-400 text-center w-full"
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
                                    ? "bg-red-600/50 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700 cursor-pointer"
                            }`}
                        >
                            {isPending ? "SENDING..." : "RESET PASSWORD"}
                        </Button>

                        <Link
                            href="/login"
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
