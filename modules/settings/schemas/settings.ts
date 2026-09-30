import * as z from "zod"

export const settingsSchema = z
    .object({
        theme: z.string(),
        language: z.string(),
        password: z.string().min(1, "Password is required"),
        newPassword: z
            .string()
            .min(6, "Password must meet application security requirements"),
        confirmPassword: z.string().min(1, "Confirm Password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

export type SettingsFormValues = z.infer<typeof settingsSchema>
