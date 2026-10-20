import { cookies } from "next/headers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../consts"
import { accessTokenCookie, refreshTokenCookie, setTokens } from "../tokens"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

describe("Token Cookies and setTokens", () => {
    const mockCookieSet = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(cookies as ReturnType<typeof vi.fn>).mockResolvedValue({
            set: mockCookieSet,
        })
    })

    describe("accessTokenCookie", () => {
        it("returns correct cookie options and value", () => {
            const token = "my-access-token"
            const cookie = accessTokenCookie(token)

            expect(cookie).toMatchObject({
                name: ACCESS_TOKEN_COOKIE,
                value: token,
                httpOnly: true,
                sameSite: "lax",
                path: "/",
            })
            expect(typeof cookie.maxAge).toBe("number")
        })
    })

    describe("refreshTokenCookie", () => {
        it("returns correct cookie options and value", () => {
            const token = "my-refresh-token"
            const cookie = refreshTokenCookie(token)

            expect(cookie).toMatchObject({
                name: REFRESH_TOKEN_COOKIE,
                value: token,
                httpOnly: true,
                sameSite: "lax",
                path: "/",
            })
            expect(typeof cookie.maxAge).toBe("number")
        })
    })

    describe("setTokens", () => {
        it("calls cookieStore.set for both access and refresh tokens", async () => {
            const accessVal = "access-123"
            const refreshVal = "refresh-456"

            await setTokens(accessVal, refreshVal)

            expect(cookies).toHaveBeenCalledTimes(1)
            expect(mockCookieSet).toHaveBeenCalledTimes(2)

            expect(mockCookieSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: ACCESS_TOKEN_COOKIE,
                    value: accessVal,
                }),
            )
            expect(mockCookieSet).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: REFRESH_TOKEN_COOKIE,
                    value: refreshVal,
                }),
            )
        })
    })
})
