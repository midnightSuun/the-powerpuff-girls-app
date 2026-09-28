import * as z from "zod"

export const resetPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(1, { message: "Password is required" })
            .min(6, { message: "Password must be at least 6 characters long" }),
        confirmPassword: z
            .string()
            .min(1, { message: "Please confirm your password" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
