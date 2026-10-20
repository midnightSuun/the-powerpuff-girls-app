import { z } from "zod"

type Messages = {
    firstNameRequired: string
    lastNameRequired: string
    firstNameTooLong: string
    lastNameTooLong: string
    departmentRequired: string
    positionRequired: string
    updateFailed: string
}

export const updateUserSchema = (messages: Messages) =>
    z.object({
        userId: z.string().min(1, { message: messages.updateFailed }),
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
        departmentId: z
            .string()
            .trim()
            .min(1, { message: messages.departmentRequired }),
        positionId: z
            .string()
            .trim()
            .min(1, { message: messages.positionRequired }),
        role: z.enum(["Admin", "Employee"], {
            message: messages.updateFailed,
        }),
    })

export type UpdateUserFormInput = z.input<ReturnType<typeof updateUserSchema>>
