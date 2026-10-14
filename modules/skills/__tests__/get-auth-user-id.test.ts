import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

import { getAuthUserId } from "../helpers/get-auth-user-id"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

describe("getAuthUserId", () => {
    const mockGetCookie = vi.fn()

    beforeEach(async () => {
        vi.clearAllMocks()

        vi.mocked(cookies).mockResolvedValue({
            get: mockGetCookie,
            has: vi.fn(),
            set: vi.fn(),
            delete: vi.fn(),
            getAll: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof cookies>>)
    })

    it("returns null when access token cookie is missing", async () => {
        mockGetCookie.mockReturnValue(undefined)

        const userId = await getAuthUserId()

        expect(mockGetCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE)
        expect(userId).toBeNull()
    })

    it("returns null when token payload format is invalid", async () => {
        mockGetCookie.mockReturnValue({ value: "invalid-token" })

        const userId = await getAuthUserId()

        expect(userId).toBeNull()
    })

    it("extracts and returns userId (sub) successfully from valid JWT", async () => {
        const payload = { sub: "user-123" }
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
            "base64",
        )
        const mockToken = `header.${encodedPayload}.signature`

        mockGetCookie.mockReturnValue({ value: mockToken })

        const userId = await getAuthUserId()

        expect(userId).toBe("user-123")
    })

    it("extracts and returns userId (id) successfully as fallback", async () => {
        const payload = { id: 456 }
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
            "base64",
        )
        const mockToken = `header.${encodedPayload}.signature`

        mockGetCookie.mockReturnValue({ value: mockToken })

        const userId = await getAuthUserId()

        expect(userId).toBe("456")
    })

    it("handles json parse or decoding errors gracefully", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        mockGetCookie.mockReturnValue({ value: "header.invalid_base64!!!.sig" })

        const userId = await getAuthUserId()

        expect(userId).toBeNull()
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1)

        consoleErrorSpy.mockRestore()
    })
})
