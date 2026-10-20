import * as z from "zod"

type Messages = {
    passwordRequired: string
    newPasswordRequired: string
    confirmPasswordRequired: string
    passwordsDoNotMatch: string
}

export const createSettingsSchema = (messages: Messages) =>
    z
        .object({
            theme: z.string(),
            language: z.string(),
            password: z.string().min(1, messages.passwordRequired),
            newPassword: z.string().min(6, messages.newPasswordRequired),
            confirmPassword: z
                .string()
                .min(1, messages.confirmPasswordRequired),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: messages.passwordsDoNotMatch,
            path: ["confirmPassword"],
        })

export type SettingsFormValues = z.infer<
    ReturnType<typeof createSettingsSchema>
>
