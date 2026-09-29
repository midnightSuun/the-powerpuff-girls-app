import { z } from "zod"

export const verificationSchema = z.object({
    code: z
        .string()
        .length(6, "Код должен содержать ровно 6 символов")
        .regex(/^\d+$/, "Код должен состоять только из цифр"),
})

export type VerificationFormValues = z.infer<typeof verificationSchema>
