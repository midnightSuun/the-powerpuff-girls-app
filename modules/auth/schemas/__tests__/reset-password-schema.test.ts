import { describe, expect, it } from "vitest"

import { createResetPasswordSchema } from "../reset-password"

describe("createResetPasswordSchema", () => {
    const messages = {
        passwordRequired: "Password is required",
        passwordMin: "Password must be at least 6 characters",
        confirmPassword: "Confirm password is required",
        passwordsDoNotMatch: "Passwords do not match",
    }

    const schema = createResetPasswordSchema(messages)

    it("successfully validates when passwords match and meet requirements", () => {
        const validData = {
            newPassword: "password123",
            confirmPassword: "password123",
        }

        const result = schema.safeParse(validData)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toEqual(validData)
        }
    })

    it("fails when newPassword is empty", () => {
        const invalidData = {
            newPassword: "",
            confirmPassword: "password123",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().newPassword?._errors).toContain(
                messages.passwordRequired,
            )
        }
    })

    it("fails when newPassword is too short", () => {
        const invalidData = {
            newPassword: "123",
            confirmPassword: "123",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().newPassword?._errors).toContain(
                messages.passwordMin,
            )
        }
    })

    it("fails when confirmPassword is empty", () => {
        const invalidData = {
            newPassword: "password123",
            confirmPassword: "",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().confirmPassword?._errors).toContain(
                messages.confirmPassword,
            )
        }
    })

    it("fails with refinement error when passwords do not match", () => {
        const invalidData = {
            newPassword: "password123",
            confirmPassword: "differentpassword",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().confirmPassword?._errors).toContain(
                messages.passwordsDoNotMatch,
            )
        }
    })
})
