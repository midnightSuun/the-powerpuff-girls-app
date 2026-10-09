import * as z from "zod"

type Messages = {
    passwordRequired: string
    passwordMin: string
    confirmPassword: string
    passwordsDoNotMatch: string
}

export const createResetPasswordSchema = (messages: Messages) =>
    z
        .object({
            newPassword: z
                .string()
                .min(1, { message: messages.passwordRequired })
                .min(6, { message: messages.passwordMin }),
            confirmPassword: z
                .string()
                .min(1, { message: messages.confirmPassword }),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: messages.passwordsDoNotMatch,
            path: ["confirmPassword"],
        })

export type ResetPasswordFormValues = z.infer<
    ReturnType<typeof createResetPasswordSchema>
>
