"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"

const loginSchema = z.object({
    email: z.string().email({ message: "Введите корректный email" }),
    password: z.string().min(6, { message: "Минимум 6 символов" }),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true)
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsPending(true)
        setError("")
        setTimeout(() => {
            setIsPending(false)
            console.log("Submitted:", data)
        }, 1000)
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
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`absolute top-6 right-6 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                    isDarkMode
                        ? "border-[#F5F5F7]/30 text-[#F5F5F7] hover:bg-white/10"
                        : "border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                }`}
            >
                Тема: {isDarkMode ? "Dark" : "Light"}
            </button>

            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex space-x-16 text-sm font-semibold tracking-wider">
                <div className="relative pb-3 cursor-pointer text-red-500">
                    <span>SIGN IN</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-red-500" />
                </div>
                <Link
                    href="/signup"
                    className={`pb-3 transition-opacity hover:opacity-80 ${
                        isDarkMode ? "text-[#F5F5F7]" : "text-neutral-500"
                    }`}
                >
                    SIGN UP
                </Link>
            </div>

            <div className="w-full max-w-125 px-6 flex flex-col items-center mt-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                        Welcome back
                    </h1>
                    <p
                        className={`text-sm ${isDarkMode ? "text-[#F5F5F7]/70" : "text-neutral-500"}`}
                    >
                        Hello again! Sign in to continue
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center space-y-6"
                >
                    <div className="w-full space-y-1">
                        <input
                            type="email"
                            placeholder="Email"
                            {...register("email")}
                            className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors ${
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

                    <div className="w-full relative space-y-1">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                {...register("password")}
                                className={`w-full bg-transparent border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors pr-12 ${
                                    isDarkMode
                                        ? "border-[#F5F5F7] text-[#F5F5F7] placeholder:text-[#F5F5F7]/50"
                                        : "border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
                                }`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors ${
                                    isDarkMode
                                        ? "text-[#F5F5F7]/70 hover:text-[#F5F5F7]"
                                        : "text-neutral-400 hover:text-neutral-700"
                                }`}
                            >
                                <svg
                                    className="size-4"
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
                            <span className="text-xs text-red-400">
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    {error && (
                        <p
                            className="text-sm text-red-400 text-center w-full"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <div className="w-full flex flex-col items-center pt-6 space-y-6">
                        <Button
                            type="submit"
                            disabled={!isValid || isPending}
                            className={`w-40 text-white transition-opacity ${
                                !isValid
                                    ? "bg-red-600/50 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700 cursor-pointer"
                            }`}
                        >
                            {isPending ? "SIGNING IN..." : "SIGN IN"}
                        </Button>

                        <Link
                            href="/forgot-password"
                            className={`text-[11px] font-medium tracking-widest uppercase transition-colors ${
                                isDarkMode
                                    ? "text-[#F5F5F7]/70 hover:text-[#F5F5F7]"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            FORGOT PASSWORD
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
