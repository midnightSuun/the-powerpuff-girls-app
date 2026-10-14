import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { connection } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { isUserRole } from "@/modules/auth/helpers/is-user-role"

import { getCurrentSession, getUserRole } from "../get-current-session"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("next/server", () => ({
    connection: vi.fn(),
}))

vi.mock("jose", () => ({
    jwtVerify: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/is-user-role", () => ({
    isUserRole: vi.fn(),
}))

describe("getCurrentSession and getUserRole", () => {
    const mockCookieGet = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        process.env.JWT_SECRET = "test-secret"
        ;(cookies as ReturnType<typeof vi.fn>).mockResolvedValue({
            get: mockCookieGet,
        })
        ;(connection as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    })

    describe("getCurrentSession", () => {
        it("returns null when access token cookie is missing", async () => {
            mockCookieGet.mockReturnValue(undefined)

            const session = await getCurrentSession()

            expect(session).toBeNull()
            expect(jwtVerify).not.toHaveBeenCalled()
        })

        it("successfully parses session when valid token with userId and role is provided", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-jwt-token" })
            ;(jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
                payload: { userId: "user-123", role: "ADMIN" },
            })
            vi.mocked(isUserRole).mockReturnValue(true)

            const session = await getCurrentSession()

            expect(connection).toHaveBeenCalledTimes(1)
            expect(jwtVerify).toHaveBeenCalledWith(
                "valid-jwt-token",
                new TextEncoder().encode("test-secret"),
            )
            expect(session).toEqual({
                userId: "user-123",
                role: "ADMIN",
            })
        })

        it("falls back to sub or id if userId is missing in payload", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-jwt-token" })
            ;(jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
                payload: { sub: "sub-user-id" },
            })
            vi.mocked(isUserRole).mockReturnValue(false)

            const session = await getCurrentSession()

            expect(session).toEqual({
                userId: "sub-user-id",
                role: null,
            })
        })

        it("returns null if userId/sub/id is missing or empty string", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-jwt-token" })
            ;(jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
                payload: { userId: "" },
            })

            const session = await getCurrentSession()

            expect(session).toBeNull()
        })

        it("returns null when jwtVerify throws an error (e.g. invalid/expired token)", async () => {
            mockCookieGet.mockReturnValue({ value: "expired-jwt-token" })
            ;(jwtVerify as ReturnType<typeof vi.fn>).mockRejectedValue(
                new Error("JWT expired"),
            )

            const session = await getCurrentSession()

            expect(session).toBeNull()
        })
    })

    describe("getUserRole", () => {
        it("returns role when session exists", async () => {
            mockCookieGet.mockReturnValue({ value: "valid-jwt-token" })
            ;(jwtVerify as ReturnType<typeof vi.fn>).mockResolvedValue({
                payload: { userId: "user-123", role: "USER" },
            })
            vi.mocked(isUserRole).mockReturnValue(true)

            const role = await getUserRole()

            expect(role).toEqual("USER")
        })

        it("returns null when session does not exist", async () => {
            mockCookieGet.mockReturnValue(undefined)

            const role = await getUserRole()

            expect(role).toBeNull()
        })
    })
})
