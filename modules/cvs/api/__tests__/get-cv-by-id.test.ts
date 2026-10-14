import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { getCvById } from "../get-cv"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    GetCvDocument: "GetCvDocument",
}))

describe("getCvById", () => {
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

    it("returns error if session is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue(null)

        const result = await getCvById("cv-123")

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("returns error if access token cookie is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue(undefined)

        const result = await getCvById("cv-123")

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("successfully fetches CV data when session and token are valid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })

        const mockCvData = { id: "cv-123", name: "John Doe's CV" }
        mockRequest.mockResolvedValue({ cv: mockCvData })

        const result = await getCvById("cv-123")

        expect(result).toEqual({ data: mockCvData })
        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith("GetCvDocument", {
            cvId: "cv-123",
        })
    })

    it("handles ClientError with session expiration correctly", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "expired-token" })

        const clientError = new ClientError(
            {
                status: 401,
                headers: {} as Headers,
                body: "",
                errors: [{ message: "Unauthorized" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "" },
        )
        mockRequest.mockRejectedValue(clientError)

        const result = await getCvById("cv-123")

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("handles generic errors during fetch gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockRejectedValue(new Error("Database failure"))

        const result = await getCvById("cv-123")

        expect(result).toEqual({ error: "fetchError" })
    })
})
