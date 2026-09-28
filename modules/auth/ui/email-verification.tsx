"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"

import {
    type VerificationFormValues,
    verificationSchema,
} from "../schemas/verification"

export function EmailVerification() {
    const router = useRouter()
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<VerificationFormValues>({
        resolver: zodResolver(verificationSchema),
        mode: "onChange",
        defaultValues: {
            code: "",
        },
    })

    const codeValue = watch("code") || ""

    const handleChange = (val: string, index: number) => {
        const digit = val.replace(/\D/g, "").slice(-1)
        const codeArray = codeValue.padEnd(6, "").split("")
        codeArray[index] = digit || ""
        const newCode = codeArray.join("").trim()

        setValue("code", newCode, { shouldValidate: true })

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (
            e.key === "Backspace" &&
            !inputRefs.current[index]?.value &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const onSubmit = (data: VerificationFormValues) => {
        setServerError(null)

        startTransition(async () => {
            console.log("Verified code:", data.code)

            router.push("/")
            router.refresh()
        })
    }

    const handleLater = () => {
        console.log("Verification skipped for later")

        router.push("/")
        router.refresh()
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

            <div className="w-full max-w-125 px-6 flex flex-col items-center">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">
                        Email verification
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Enter the verification code we sent to your email
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center space-y-6"
                    noValidate
                >
                    <div className="flex justify-center gap-3 w-full">
                        {Array.from({ length: 6 }).map((_, index) => {
                            const digitValue = codeValue[index] || ""
                            return (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digitValue}
                                    onChange={(e) =>
                                        handleChange(e.target.value, index)
                                    }
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-11 h-12 text-center text-lg bg-transparent border border-input rounded-md focus:outline-none focus:border-primary transition-colors text-foreground"
                                />
                            )
                        })}
                    </div>

                    {errors.code && (
                        <p
                            className="text-xs text-destructive text-center"
                            role="alert"
                        >
                            {errors.code.message}
                        </p>
                    )}

                    {serverError && (
                        <p
                            className="text-xs text-destructive text-center w-full"
                            role="alert"
                        >
                            {serverError}
                        </p>
                    )}

                    <div className="w-full flex flex-col items-center pt-4 space-y-4">
                        <Button
                            type="submit"
                            disabled={!isValid || isPending}
                            className={`w-36 text-white transition-opacity ${
                                !isValid || isPending
                                    ? "bg-button-disabled cursor-not-allowed"
                                    : "bg-button-primary-default hover:bg-button-primary-default/90 cursor-pointer"
                            }`}
                        >
                            {isPending ? "CHECKING..." : "CONFIRM"}
                        </Button>

                        <button
                            type="button"
                            onClick={handleLater}
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors pt-2"
                        >
                            LATER
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
