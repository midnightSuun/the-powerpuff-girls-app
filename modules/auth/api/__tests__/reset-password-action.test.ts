import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql, ResetPasswordDocument } from "@/gql"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../consts"
import { resetPasswordAction } from "../reset-password"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    ResetPasswordDocument: "ResetPasswordDocument",
}))

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

describe("resetPasswordAction Server Action", () => {
    const mockRequest = vi.fn()
    const mockCookieDelete = vi.fn()

    const validFormData = {
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
    }

    beforeEach(() => {
        vi.clearAllMocks()
        ;(getGql as ReturnType<typeof vi.fn>).mockResolvedValue({
            request: mockRequest,
        })
        ;(cookies as ReturnType<typeof vi.fn>).mockResolvedValue({
            delete: mockCookieDelete,
        })
    })

    it("returns error when token is missing", async () => {
        const result = await resetPasswordAction(validFormData, "")

        expect(result).toEqual({ error: "resetTokenInvalid" })
        expect(getGql).not.toHaveBeenCalled()
    })

    it("successfully resets password and deletes cookies", async () => {
        mockRequest.mockResolvedValueOnce({})

        const result = await resetPasswordAction(validFormData, "valid-token")

        expect(getGql).toHaveBeenCalledWith("valid-token")
        expect(mockRequest).toHaveBeenCalledWith(ResetPasswordDocument, {
            auth: {
                newPassword: validFormData.newPassword,
                confirmPassword: validFormData.confirmPassword,
            },
        })
        expect(mockCookieDelete).toHaveBeenCalledTimes(2)
        expect(mockCookieDelete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE)
        expect(mockCookieDelete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE)
        expect(result).toEqual({})
    })

    it("returns resetExpired error when ClientError message contains 'expired'", async () => {
        const clientError = new ClientError(
            {
                status: 400,
                headers: new Headers(),
                errors: [{ message: "Token has expired" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "", variables: {} },
        )

        mockRequest.mockRejectedValueOnce(clientError)

        const result = await resetPasswordAction(validFormData, "expired-token")

        expect(result).toEqual({ error: "resetExpired" })
        expect(mockCookieDelete).not.toHaveBeenCalled()
    })

    it("returns resetFailed error for generic unhandled exceptions", async () => {
        mockRequest.mockRejectedValueOnce(new Error("Database offline"))

        const result = await resetPasswordAction(validFormData, "valid-token")

        expect(result).toEqual({ error: "resetFailed" })
        expect(mockCookieDelete).not.toHaveBeenCalled()
    })
})
