"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useEmailVerification } from "../hooks/use-email-verification"

type EmailVerificationProps = {
    email: string
    sendFailed: boolean
    accessToken?: string
}

export function EmailVerification({
    email,
    sendFailed,
    accessToken,
}: EmailVerificationProps) {
    const t = useTranslations("Auth.EmailVerification")
    const {
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
    } = useEmailVerification(email, sendFailed, accessToken)

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-300 relative bg-background text-foreground">
            <div className="w-full max-w-125 px-6 flex flex-col items-center">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">
                        {t("title")}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {t("subtitle")} {email || t("fallbackEmail")}
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
                            const hasError = Boolean(errors.code)
                            return (
                                <Input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digitValue}
                                    error={hasError ? "" : undefined}
                                    aria-invalid={hasError}
                                    onChange={(e) =>
                                        handleChange(e.target.value, index)
                                    }
                                    onPaste={handlePaste}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-11 h-12 text-center text-lg p-0"
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

                    {statusMessage && (
                        <p
                            className="text-xs text-green-600 text-center w-full dark:text-green-400"
                            role="status"
                        >
                            {statusMessage}
                        </p>
                    )}

                    <div className="w-full flex flex-col items-center pt-4 space-y-4">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!isValid || isPending}
                        >
                            {isPending
                                ? t("submittingButton")
                                : t("submitButton")}
                        </Button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!email || isResending}
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isResending
                                ? t("resendingButton")
                                : t("resendButton")}
                        </button>

                        <button
                            type="button"
                            onClick={handleLater}
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors pt-2"
                        >
                            {t("laterButton")}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}
