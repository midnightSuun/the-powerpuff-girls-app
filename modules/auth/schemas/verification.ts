import { z } from "zod"

type Messages = {
    codeLength: string
    codeDigits: string
}

export const createVerificationSchema = (messages: Messages) =>
    z.object({
        code: z
            .string()
            .length(6, { message: messages.codeLength })
            .regex(/^\d+$/, { message: messages.codeDigits }),
    })

export type VerificationFormValues = z.infer<
    ReturnType<typeof createVerificationSchema>
>
