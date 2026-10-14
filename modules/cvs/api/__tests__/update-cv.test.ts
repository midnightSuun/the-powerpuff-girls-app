import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { updateCvAction } from "../update-cv"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    UpdateCvDocument: { kind: "Document", definitions: [] },
}))

describe("updateCvAction", () => {
    const mockRequest = vi.fn()
    const mockCookieGet = vi.fn()

    const validPayload = {
        cvId: "cv-1",
        name: "John Doe",
        education: "MIT",
        description: "Software Engineer",
    }

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

        const result = await updateCvAction(validPayload)

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("returns error if required fields are missing or empty", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateCvAction({
            ...validPayload,
            name: "   ",
        })

        expect(result).toEqual({
            error: "CV id, name, education, and description are required.",
        })
    })

    it("returns error if access token cookie is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue(undefined)

        const result = await updateCvAction(validPayload)

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("successfully updates CV when input and session are valid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockResolvedValue({})

        const result = await updateCvAction(validPayload)

        expect(result).toEqual({})
        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
            cv: {
                cvId: "cv-1",
                name: "John Doe",
                education: "MIT",
                description: "Software Engineer",
            },
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

        const result = await updateCvAction(validPayload)

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("handles generic errors during update gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockRejectedValue(new Error("Database failure"))

        const result = await updateCvAction(validPayload)

        expect(result).toEqual({ error: "updateError" })
    })
})
