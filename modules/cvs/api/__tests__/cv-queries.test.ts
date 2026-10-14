import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"

import { getAdminCvs, getUserCvs } from "../cvs"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    GetAdminCvsDocument: "GetAdminCvsDocument",
    GetUserCvsDocument: "GetUserCvsDocument",
}))

describe("CV Queries (getAdminCvs & getUserCvs)", () => {
    const mockRequest = vi.fn()
    const mockCookieGet = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(cookies).mockResolvedValue({
            get: mockCookieGet,
        } as unknown as Awaited<ReturnType<typeof cookies>>)
        vi.mocked(getGql).mockResolvedValue({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)
    })

    describe("getAdminCvs", () => {
        it("successfully fetches admin CVs when token is valid", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-token" })
            const mockCvs = [{ id: "1", name: "CV 1" }]
            mockRequest.mockResolvedValue({ cvs: mockCvs })

            const result = await getAdminCvs({ limit: 10 })

            expect(result).toEqual(mockCvs)
            expect(mockRequest).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith("GetAdminCvsDocument", {
                params: { limit: 10 },
            })
        })

        it("throws session expired error on ClientError with unauthorized message", async () => {
            mockCookieGet.mockReturnValue({ value: "expired-token" })
            const clientError = new ClientError(
                {
                    status: 401,
                    headers: {} as Headers,
                    body: "",
                    errors: [{ message: "Session expired" }],
                } as unknown as ConstructorParameters<typeof ClientError>[0],
                { query: "" },
            )
            mockRequest.mockRejectedValue(clientError)

            await expect(getAdminCvs()).rejects.toThrow(
                "Your session has expired. Please log in again.",
            )
        })

        it("throws general error on unexpected failures", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-token" })
            mockRequest.mockRejectedValue(new Error("Network Error"))

            await expect(getAdminCvs()).rejects.toThrow(
                "Failed to fetch admin CVs.",
            )
        })
    })

    describe("getUserCvs", () => {
        it("successfully fetches user CVs for a given userId", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-token" })
            const mockCvs = [{ id: "2", name: "User CV" }]
            mockRequest.mockResolvedValue({ cvsByUserId: mockCvs })

            const result = await getUserCvs("user-123", { limit: 5 })

            expect(result).toEqual(mockCvs)
            expect(mockRequest).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith("GetUserCvsDocument", {
                userId: "user-123",
                params: { limit: 5 },
            })
        })

        it("throws session expired error on ClientError with expiration", async () => {
            mockCookieGet.mockReturnValue({ value: "bad-token" })
            const clientError = new ClientError(
                {
                    status: 401,
                    headers: {} as Headers,
                    body: "",
                    errors: [{ message: "Unauthorized access" }],
                } as unknown as ConstructorParameters<typeof ClientError>[0],
                { query: "" },
            )
            mockRequest.mockRejectedValue(clientError)

            await expect(getUserCvs("user-123")).rejects.toThrow(
                "Your session has expired. Please log in again.",
            )
        })

        it("throws general error when request fails", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-token" })
            mockRequest.mockRejectedValue(new Error("Database error"))

            await expect(getUserCvs("user-123")).rejects.toThrow(
                "Failed to fetch user CVs.",
            )
        })
    })
})
