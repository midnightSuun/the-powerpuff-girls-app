import { describe, expect, it } from "vitest"

import { createSettingsSchema } from "../schemas/settings"

describe("Settings Schema", () => {
    const messages = {
        passwordRequired: "Password is required",
        newPasswordRequired: "New password is required",
        confirmPasswordRequired: "Confirm password is required",
        passwordsDoNotMatch: "Passwords do not match",
    }

    const schema = createSettingsSchema(messages)

    it("validates correct settings form with matching passwords", () => {
        const data = {
            theme: "Dark",
            language: "en",
            password: "oldPassword123",
            newPassword: "newPassword123",
            confirmPassword: "newPassword123",
        }

        const result = schema.safeParse(data)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data).toEqual(data)
        }
    })

    it("rejects passwords that do not match", () => {
        const data = {
            theme: "Dark",
            language: "en",
            password: "oldPassword123",
            newPassword: "newPassword123",
            confirmPassword: "differentPassword123",
        }

        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    message: messages.passwordsDoNotMatch,
                    path: ["confirmPassword"],
                }),
            )
        }
    })

    it("rejects when password is empty", () => {
        const data = {
            theme: "Dark",
            language: "en",
            password: "",
            newPassword: "newPassword123",
            confirmPassword: "newPassword123",
        }

        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    message: messages.passwordRequired,
                    path: ["password"],
                }),
            )
        }
    })

    it("rejects when newPassword is less than 6 characters", () => {
        const data = {
            theme: "Dark",
            language: "en",
            password: "oldPassword123",
            newPassword: "short",
            confirmPassword: "short",
        }

        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    message: messages.newPasswordRequired,
                    path: ["newPassword"],
                }),
            )
        }
    })

    it("rejects when confirmPassword is empty", () => {
        const data = {
            theme: "Dark",
            language: "en",
            password: "oldPassword123",
            newPassword: "newPassword123",
            confirmPassword: "",
        }

        const result = schema.safeParse(data)

        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues).toContainEqual(
                expect.objectContaining({
                    message: messages.confirmPasswordRequired,
                    path: ["confirmPassword"],
                }),
            )
        }
    })
})
