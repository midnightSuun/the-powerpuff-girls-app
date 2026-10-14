import { ClientError } from "graphql-request"
import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { createCvAction } from "../create-cv"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    CreateCvDocument: "CreateCvDocument",
}))

describe("createCvAction", () => {
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

        const result = await createCvAction({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
        })

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("returns error if userId format is invalid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await createCvAction({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
            userId: "   ",
        })

        expect(result).toEqual({ error: "User id is required." })
    })

    it("returns error if non-admin tries to create CV for another user", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await createCvAction({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
            userId: "user-2",
        })

        expect(result).toEqual({
            error: "You can only create CVs for yourself.",
        })
    })

    it("returns error if required fields are missing or empty", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await createCvAction({
            name: "   ",
            education: "MIT",
            description: "",
        })

        expect(result).toEqual({
            error: "Name, education, and description are required.",
        })
    })

    it("returns error if access token cookie is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue(undefined)

        const result = await createCvAction({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
        })

        expect(result).toEqual({ error: "sessionExpired" })
    })

    it("successfully creates a CV when input and session are valid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        mockCookieGet.mockReturnValue({ value: "valid-token" })
        mockRequest.mockResolvedValue({})

        const result = await createCvAction({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
        })

        expect(result).toEqual({})
        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith("CreateCvDocument", {
            cv: {
                name: "John Doe",
                education: "MIT",
                description: "Software Engineer",
                userId: "user-1",
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

        const result = await createCvAction({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
        })

        expect(result).toEqual({ error: "sessionExpired" })
    })
})
