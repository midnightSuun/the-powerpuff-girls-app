"use client"

import { Button } from "@/components/ui/button"

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
                        Email verification
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Enter the verification code we sent to{" "}
                        {email || "your email"}
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
                                    onPaste={handlePaste}
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

                    {statusMessage && (
                        <p
                            className="text-xs text-green-600 text-center w-full"
                            role="status"
                        >
                            {statusMessage}
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
                            onClick={handleResend}
                            disabled={!email || isResending}
                            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isResending ? "SENDING..." : "RESEND EMAIL"}
                        </button>

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
        </main>
    )
}
