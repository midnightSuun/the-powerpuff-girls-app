import { z } from "zod"

type Messages = {
    emailRequired: string
    invalidEmail: string
    passwordRequired: string
    passwordMin: string
    firstNameRequired: string
    lastNameRequired: string
    firstNameTooLong: string
    lastNameTooLong: string
    createFailed: string
}

const optionalId = z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)

export const createUserSchema = (messages: Messages) =>
    z.object({
        email: z
            .string()
            .trim()
            .min(1, { message: messages.emailRequired })
            .email({ message: messages.invalidEmail }),
        password: z
            .string()
            .min(1, { message: messages.passwordRequired })
            .min(6, { message: messages.passwordMin }),
        firstName: z
            .string()
            .trim()
            .min(1, { message: messages.firstNameRequired })
            .max(100, { message: messages.firstNameTooLong }),
        lastName: z
            .string()
            .trim()
            .min(1, { message: messages.lastNameRequired })
            .max(100, { message: messages.lastNameTooLong }),
        departmentId: optionalId,
        positionId: optionalId,
        role: z.enum(["Admin", "Employee"], {
            message: messages.createFailed,
        }),
    })

export type CreateUserFormInput = z.input<ReturnType<typeof createUserSchema>>
