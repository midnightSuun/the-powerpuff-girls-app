import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../consts"
import { logout } from "../logout"

vi.mock("next/headers", () => ({
    cookies: vi.fn(),
}))

vi.mock("next/navigation", () => ({
    redirect: vi.fn((url) => {
        throw new Error(`NEXT_REDIRECT:${url}`)
    }),
}))

describe("logout Server Action", () => {
    const mockCookieDelete = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(cookies as ReturnType<typeof vi.fn>).mockResolvedValue({
            delete: mockCookieDelete,
        })
    })

    it("successfully deletes auth cookies and redirects to '/login'", async () => {
        await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login")

        expect(cookies).toHaveBeenCalledTimes(1)
        expect(mockCookieDelete).toHaveBeenCalledTimes(2)
        expect(mockCookieDelete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE)
        expect(mockCookieDelete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE)
        expect(redirect).toHaveBeenCalledWith("/login")
    })
})
