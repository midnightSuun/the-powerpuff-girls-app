import * as z from "zod"

type Messages = {
    emailRequired: string
    invalidEmail: string
    passwordRequired: string
    passwordMin: string
    confirmPassword: string
    passwordsDoNotMatch: string
}

export const createSignUpSchema = (messages: Messages) =>
    z
        .object({
            email: z
                .string()
                .min(1, { message: messages.emailRequired })
                .email({ message: messages.invalidEmail }),
            password: z
                .string()
                .min(1, { message: messages.passwordRequired })
                .min(6, { message: messages.passwordMin }),
            confirmPassword: z
                .string()
                .min(1, { message: messages.confirmPassword }),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: messages.passwordsDoNotMatch,
            path: ["confirmPassword"],
        })

export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
