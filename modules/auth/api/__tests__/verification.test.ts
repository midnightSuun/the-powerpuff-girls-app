import { ClientError } from "graphql-request"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getUser } from "@/modules/users/api/get-user"

import {
    sendProfileVerificationAction,
    sendVerificationAction,
    verifyMailAction,
} from "../verification"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/modules/users/api/get-user", () => ({
    getUser: vi.fn(),
}))

describe("Verification Server Actions", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(getGql as ReturnType<typeof vi.fn>).mockResolvedValue({
            request: mockRequest,
        })
    })

    describe("sendVerificationAction", () => {
        it("returns error when email is empty or whitespace", async () => {
            const result = await sendVerificationAction("   ")

            expect(result).toEqual({ error: "verificationEmailUnavailable" })
            expect(getGql).not.toHaveBeenCalled()
        })

        it("successfully sends verification email", async () => {
            mockRequest.mockResolvedValueOnce({})

            const result = await sendVerificationAction("test@example.com")

            expect(getGql).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
                email: "test@example.com",
            })
            expect(result).toEqual({})
        })

        it("returns error when request fails", async () => {
            mockRequest.mockRejectedValueOnce(new Error("Network error"))

            const result = await sendVerificationAction("test@example.com")

            expect(result).toEqual({ error: "verificationSendFailed" })
        })
    })

    describe("sendProfileVerificationAction", () => {
        it("returns error when session is missing", async () => {
            ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue(
                null,
            )

            const result = await sendProfileVerificationAction()

            expect(result).toEqual({ error: "sessionExpired" })
            expect(getUser).not.toHaveBeenCalled()
        })

        it("successfully sends profile verification using current user email", async () => {
            ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue({
                userId: "user-1",
            })
            ;(getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
                email: "profile@example.com",
            })
            mockRequest.mockResolvedValueOnce({})

            const result = await sendProfileVerificationAction()

            expect(getUser).toHaveBeenCalledWith("user-1")
            expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
                email: "profile@example.com",
            })
            expect(result).toEqual({})
        })

        it("returns error when loading user fails", async () => {
            ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue({
                userId: "user-1",
            })
            ;(getUser as ReturnType<typeof vi.fn>).mockRejectedValue(
                new Error("User not found"),
            )

            const result = await sendProfileVerificationAction()

            expect(result).toEqual({ error: "verificationSendFailed" })
        })
    })

    describe("verifyMailAction", () => {
        it("returns error when OTP length is not 6 digits", async () => {
            const result = await verifyMailAction("12345")

            expect(result).toEqual({ error: "verificationInvalid" })
            expect(getGql).not.toHaveBeenCalled()
        })

        it("successfully verifies mail with normalized otp", async () => {
            mockRequest.mockResolvedValueOnce({})

            const result = await verifyMailAction("123-456", "token-123")

            expect(getGql).toHaveBeenCalledWith("token-123")
            expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
                mail: { otp: "123456" },
            })
            expect(result).toEqual({})
        })

        it("returns sessionExpired error when ClientError message contains unauthorized", async () => {
            const clientError = new ClientError(
                {
                    status: 401,
                    headers: new Headers(),
                    errors: [{ message: "Unauthorized access" }],
                } as unknown as ConstructorParameters<typeof ClientError>[0],
                { query: "", variables: {} },
            )

            mockRequest.mockRejectedValueOnce(clientError)

            const result = await verifyMailAction("123456")

            expect(result).toEqual({ error: "sessionExpired" })
        })

        it("returns verificationInvalid error for general errors", async () => {
            const clientError = new ClientError(
                {
                    status: 400,
                    headers: new Headers(),
                    errors: [{ message: "Invalid OTP code" }],
                } as unknown as ConstructorParameters<typeof ClientError>[0],
                { query: "", variables: {} },
            )

            mockRequest.mockRejectedValueOnce(clientError)

            const result = await verifyMailAction("123456")

            expect(result).toEqual({ error: "verificationInvalid" })
        })
    })
})
