"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { sendVerificationAction, verifyMailAction } from "../api/verification"
import {
    type VerificationFormValues,
    verificationSchema,
} from "../schemas/verification"

export function useEmailVerification(email: string, sendFailed: boolean) {
    const router = useRouter()
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | null>(
        sendFailed
            ? "We couldn't send the verification email. Please try again."
            : null,
    )
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [isResending, startResendTransition] = useTransition()

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
        setStatusMessage(null)

        startTransition(async () => {
            const result = await verifyMailAction(data.code)

            if (result.error) {
                setServerError(result.error)
                return
            }

            router.push("/")
            router.refresh()
        })
    }

    const handleResend = () => {
        setServerError(null)
        setStatusMessage(null)

        startResendTransition(async () => {
            const result = await sendVerificationAction(email)

            if (result.error) {
                setServerError(result.error)
                return
            }

            setStatusMessage("A new verification email has been sent.")
        })
    }

    const handleLater = () => {
        router.push("/")
        router.refresh()
    }

    return {
        isDarkMode,
        setIsDarkMode,
        serverError,
        statusMessage,
        isPending,
        isResending,
        inputRefs,
        handleSubmit,
        onSubmit,
        handleResend,
        handleLater,
        handleChange,
        handleKeyDown,
        codeValue,
        errors,
        isValid,
    }
}
