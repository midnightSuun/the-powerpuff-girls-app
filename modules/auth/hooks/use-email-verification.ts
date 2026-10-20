"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import { sendVerificationAction, verifyMailAction } from "../api/verification"
import {
    createVerificationSchema,
    type VerificationFormValues,
} from "../schemas/verification"

export function useEmailVerification(
    email: string,
    sendFailed: boolean,
    accessToken?: string,
) {
    const validation = useTranslations("Auth.validation")
    const t = useTranslations("Auth.messages")
    const router = useRouter()
    const [serverError, setServerError] = useState<string | null>(
        sendFailed ? t("verificationSendFailed") : null,
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
        resolver: zodResolver(
            createVerificationSchema({
                codeLength: validation("codeLength"),
                codeDigits: validation("codeDigits"),
            }),
        ),
        mode: "onChange",
        defaultValues: {
            code: "",
        },
    })

    const codeValue = watch("code") || ""

    const setCode = (nextCode: string) => {
        setValue("code", nextCode.slice(0, 6), { shouldValidate: true })
    }

    const handleChange = (val: string, index: number) => {
        const digits = val.replace(/\D/g, "")

        if (digits.length > 1) {
            setCode(digits)
            inputRefs.current[Math.min(digits.length, 5)]?.focus()
            return
        }

        const codeArray = Array.from(
            { length: 6 },
            (_, slot) => codeValue[slot] ?? "",
        )
        codeArray[index] = digits.slice(-1)
        setCode(codeArray.join(""))

        if (digits && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const digits = event.clipboardData.getData("text").replace(/\D/g, "")

        if (!digits) {
            return
        }

        event.preventDefault()
        setCode(digits)
        inputRefs.current[Math.min(digits.length, 5)]?.focus()
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
            const result = await verifyMailAction(data.code, accessToken)

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

            setStatusMessage(t("verificationSent"))
        })
    }

    const handleLater = () => {
        router.push("/")
        router.refresh()
    }

    return {
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
        handlePaste,
        handleKeyDown,
        codeValue,
        errors,
        isValid,
    }
}
