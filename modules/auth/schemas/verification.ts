import { z } from "zod"

export const verificationSchema = z.object({
    code: z
        .string()
        .length(6, { message: "Verification code must be exactly 6 digits." })
        .regex(/^\d+$/, {
            message: "Verification code must contain only numbers.",
        }),
})

export type VerificationFormValues = z.infer<typeof verificationSchema>
