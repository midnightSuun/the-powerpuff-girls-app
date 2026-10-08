import * as z from "zod"

type Messages = {
    emailRequired: string
    invalidEmail: string
    passwordRequired: string
    passwordMin: string
}

export const createLoginSchema = (messages: Messages) =>
    z.object({
        email: z
            .string()
            .min(1, { message: messages.emailRequired })
            .email({ message: messages.invalidEmail })
            .prefault(""),
        password: z
            .string()
            .min(1, { message: messages.passwordRequired })
            .min(6, { message: messages.passwordMin })
            .prefault(""),
    })

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>
