import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { deleteCvAction } from "../delete-cv"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    DeleteCvDocument: "DeleteCvDocument",
}))

describe("deleteCvAction", () => {
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

        const result = await deleteCvAction("cv-123")

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("returns error if cvId is missing or empty", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await deleteCvAction("")

        expect(result).toEqual({ error: "CV id is required." })
    })

    it("returns error if access token cookie is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue(undefined)

        const result = await deleteCvAction("cv-123")

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("returns error if CV could not be deleted (affected is 0)", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockResolvedValue({ deleteCv: { affected: 0 } })

        const result = await deleteCvAction("cv-123")

        expect(result).toEqual({
            error: "CV could not be deleted. It may no longer exist.",
        })
    })

    it("successfully deletes CV when session, token and request are valid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockResolvedValue({ deleteCv: { affected: 1 } })

        const result = await deleteCvAction("cv-123")

        expect(result).toEqual({})
        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith("DeleteCvDocument", {
            cv: { cvId: "cv-123" },
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
                errors: [{ message: "Token expired" }],
            } as unknown as ConstructorParameters<typeof ClientError>[0],
            { query: "" },
        )
        mockRequest.mockRejectedValue(clientError)

        const result = await deleteCvAction("cv-123")

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("handles generic errors during deletion gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockRejectedValue(new Error("Database failure"))

        const result = await deleteCvAction("cv-123")

        expect(result).toEqual({ error: "deleteError" })
    })
})
