"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"

import { requestPasswordReset } from "../api/forgot-password"
import type { AuthActionState } from "../api/login"

const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

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
            className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative ${
                isDarkMode
                    ? "bg-[#454545] text-[#F5F5F7]"
                    : "bg-white text-neutral-900"
            }`}
        >
            <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`absolute top-6 right-6 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                    isDarkMode
                        ? "border-[#F5F5F7]/30 text-[#F5F5F7] hover:bg-white/10"
                        : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                }`}
            >
                Theme: {isDarkMode ? "Dark" : "Light"}
            </button>

            <div className="w-full max-w-125 px-6 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h1 className="text-3xl tracking-tight mb-2">
                        Forgot password
                    </h1>
                    <p
                        className={`text-sm ${
                            isDarkMode
                                ? "text-[#F5F5F7]/70"
                                : "text-neutral-500"
                        }`}
                    >
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
                            className={`block text-xs uppercase tracking-wider ${
                                isDarkMode
                                    ? "text-[#F5F5F7]/70"
                                    : "text-neutral-500"
                            }`}
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            {...register("email")}
                            className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors ${
                                errors.email ? "border-red-500" : ""
                            } ${
                                isDarkMode
                                    ? "border-[#F5F5F7] text-[#F5F5F7] placeholder:text-[#F5F5F7]/50"
                                    : "border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
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
                            className={`text-[11px] font-medium tracking-widest uppercase transition-colors ${
                                isDarkMode
                                    ? "text-[#F5F5F7]/70 hover:text-[#F5F5F7]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
