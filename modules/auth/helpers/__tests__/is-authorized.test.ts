import { describe, expect, it, vi } from "vitest"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../../consts"
import { isAuthorized } from "../is-authorized"

describe("isAuthorized helper", () => {
    it("returns true when both access and refresh token cookies are present", () => {
        const mockCookieStore = {
            get: vi.fn((name: string) => {
                if (name === ACCESS_TOKEN_COOKIE)
                    return { value: "access-token-val" }
                if (name === REFRESH_TOKEN_COOKIE)
                    return { value: "refresh-token-val" }
                return undefined
            }),
        }

        const result = isAuthorized(mockCookieStore)

        expect(result).toBe(true)
        expect(mockCookieStore.get).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE)
        expect(mockCookieStore.get).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE)
    })

    it("returns true when only access token cookie is present", () => {
        const mockCookieStore = {
            get: vi.fn((name: string) => {
                if (name === ACCESS_TOKEN_COOKIE)
                    return { value: "access-token-val" }
                return undefined
            }),
        }

        const result = isAuthorized(mockCookieStore)

        expect(result).toBe(true)
    })

    it("returns true when only refresh token cookie is present", () => {
        const mockCookieStore = {
            get: vi.fn((name: string) => {
                if (name === REFRESH_TOKEN_COOKIE)
                    return { value: "refresh-token-val" }
                return undefined
            }),
        }

        const result = isAuthorized(mockCookieStore)

        expect(result).toBe(true)
    })

    it("returns false when neither token cookie is present", () => {
        const mockCookieStore = {
            get: vi.fn().mockReturnValue(undefined),
        }

        const result = isAuthorized(mockCookieStore)

        expect(result).toBe(false)
    })
})
