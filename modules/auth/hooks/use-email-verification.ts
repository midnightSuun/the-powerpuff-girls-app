"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import {
    type VerificationFormValues,
    verificationSchema,
} from "../schemas/verification"

export function useEmailVerification() {
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

    return {
        isDarkMode,
        setIsDarkMode,
        serverError,
        isPending,
        inputRefs,
        handleSubmit,
        onSubmit,
        handleLater,
        handleChange,
        handleKeyDown,
        codeValue,
        errors,
        isValid,
    }
}
