import * as z from "zod"

type Messages = {
    emailRequired: string
    invalidEmail: string
}

export const createForgotPasswordSchema = (messages: Messages) =>
    z.object({
        email: z
            .string()
            .min(1, { message: messages.emailRequired })
            .email({ message: messages.invalidEmail }),
    })

export type ForgotPasswordFormValues = z.infer<
    ReturnType<typeof createForgotPasswordSchema>
>
