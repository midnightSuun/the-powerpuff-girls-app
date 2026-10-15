import { describe, expect, it, vi } from "vitest"

import UserDetailRoute from "../[locale]/(protected)/users/[userId]/page"

const mockRedirect = vi.fn()
vi.mock("@/i18n/navigation", () => ({
    redirect: (params: unknown) => {
        mockRedirect(params)
        return new Error(`NEXT_REDIRECT`)
    },
}))

describe("UserDetailRoute Server Component", () => {
    it("redirects to the user profile page with correct locale and userId", async () => {
        const params = Promise.resolve({ locale: "en", userId: "user-123" })

        try {
            await UserDetailRoute({ params })
        } catch {}

        expect(mockRedirect).toHaveBeenCalledWith({
            href: "/users/user-123/profile",
            locale: "en",
        })
    })
})
