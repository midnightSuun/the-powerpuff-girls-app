import { describe, expect, it } from "vitest"

import { createSignUpSchema } from "../signup"

describe("createSignUpSchema", () => {
    const messages = {
        emailRequired: "Email is required",
        invalidEmail: "Invalid email address",
        passwordRequired: "Password is required",
        passwordMin: "Password must be at least 6 characters",
        confirmPassword: "Confirm password is required",
        passwordsDoNotMatch: "Passwords do not match",
    }

    const schema = createSignUpSchema(messages)

    it("successfully validates when all fields are correct and matching", () => {
        const validData = {
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
        }

        const result = schema.safeParse(validData)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toEqual(validData)
        }
    })

    it("fails when email is empty", () => {
        const invalidData = {
            email: "",
            password: "password123",
            confirmPassword: "password123",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().email?._errors).toContain(
                messages.emailRequired,
            )
        }
    })

    it("fails when email format is invalid", () => {
        const invalidData = {
            email: "invalid-email",
            password: "password123",
            confirmPassword: "password123",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().email?._errors).toContain(
                messages.invalidEmail,
            )
        }
    })

    it("fails when password is empty", () => {
        const invalidData = {
            email: "test@example.com",
            password: "",
            confirmPassword: "",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().password?._errors).toContain(
                messages.passwordRequired,
            )
        }
    })

    it("fails when password is too short", () => {
        const invalidData = {
            email: "test@example.com",
            password: "123",
            confirmPassword: "123",
        }

        const result = schema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.format().password?._errors).toContain(
                messages.passwordMin,
            )
        }
    })

    it("fails when confirmPassword is empty", () => {
        const invalidData = {
            email: "test@example.com",
            password: "password123",
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
            email: "test@example.com",
            password: "password123",
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
