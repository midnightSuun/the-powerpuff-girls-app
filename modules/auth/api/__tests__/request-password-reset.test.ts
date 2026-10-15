import { beforeEach, describe, expect, it, vi } from "vitest"

import { ForgotPasswordDocument, getGql } from "@/gql"

import { requestPasswordReset } from "../forgot-password"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    ForgotPasswordDocument: "ForgotPasswordDocument",
}))

describe("requestPasswordReset Server Action", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(getGql as ReturnType<typeof vi.fn>).mockResolvedValue({
            request: mockRequest,
        })
    })

    it("successfully requests password reset with trimmed email", async () => {
        mockRequest.mockResolvedValueOnce({})

        const result = await requestPasswordReset("   test@example.com   ")

        expect(getGql).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith(ForgotPasswordDocument, {
            email: "test@example.com",
        })
        expect(result).toEqual({})
    })

    it("returns localized account not found error when GraphQL returns USER_NOT_FOUND", async () => {
        const graphqlError = {
            response: {
                errors: [
                    {
                        message: "User not found",
                        extensions: { code: "USER_NOT_FOUND" },
                    },
                ],
            },
        }
        mockRequest.mockRejectedValueOnce(graphqlError)

        const result = await requestPasswordReset("unknown@example.com")

        expect(result).toEqual({ error: "forgotAccountNotFound" })
    })

    it("returns localized account not found error when GraphQL returns NOT_FOUND code", async () => {
        const graphqlError = {
            response: {
                errors: [
                    {
                        message: "Resource missing",
                        extensions: { code: "NOT_FOUND" },
                    },
                ],
            },
        }
        mockRequest.mockRejectedValueOnce(graphqlError)

        const result = await requestPasswordReset("unknown@example.com")

        expect(result).toEqual({ error: "forgotAccountNotFound" })
    })

    it("returns localized account not found error when error message contains alternative phrasing", async () => {
        const errorsList = [
            "No account found with this email",
            "No user registered",
            "User does not exist",
            "Account does not exist",
        ]

        for (const msg of errorsList) {
            mockRequest.mockRejectedValueOnce({
                response: { errors: [{ message: msg }] },
            })
            const result = await requestPasswordReset("test@example.com")
            expect(result).toEqual({ error: "forgotAccountNotFound" })
        }
    })

    it("returns localized server error when network error occurs via code property", async () => {
        const networkError = {
            code: "NETWORK_ERROR",
        }
        mockRequest.mockRejectedValueOnce(networkError)

        const result = await requestPasswordReset("test@example.com")

        expect(result).toEqual({ error: "forgotServerError" })
    })

    it("returns localized server error when network error occurs via name property", async () => {
        const networkError = {
            name: "NetworkError",
        }
        mockRequest.mockRejectedValueOnce(networkError)

        const result = await requestPasswordReset("test@example.com")

        expect(result).toEqual({ error: "forgotServerError" })
    })

    it("returns localized server error when network error occurs inside request property", async () => {
        const networkError = {
            request: {
                errors: [{ extensions: { code: "NETWORK_ERROR" } }],
            },
        }
        mockRequest.mockRejectedValueOnce(networkError)

        const result = await requestPasswordReset("test@example.com")

        expect(result).toEqual({ error: "forgotServerError" })
    })

    it("returns localized server error for unhandled exceptions", async () => {
        mockRequest.mockRejectedValueOnce(new Error("Unexpected failure"))

        const result = await requestPasswordReset("test@example.com")

        expect(result).toEqual({ error: "forgotServerError" })
    })
})
