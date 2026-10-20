import { render } from "@testing-library/react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AUTH_NOTIFICATION_STORAGE_KEY } from "../../consts"
import { AuthNotificationListener } from "../auth-notification-listener"

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
    },
}))

describe("AuthNotificationListener Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        sessionStorage.clear()
    })

    afterEach(() => {
        sessionStorage.clear()
    })

    it("does nothing when sessionStorage is empty", () => {
        vi.mocked(usePathname).mockReturnValue("/dashboard")
        render(<AuthNotificationListener />)

        expect(toast.success).not.toHaveBeenCalled()
    })

    it("shows login toast when notification is 'login' and path is not /login", () => {
        sessionStorage.setItem(AUTH_NOTIFICATION_STORAGE_KEY, "login")
        vi.mocked(usePathname).mockReturnValue("/dashboard")

        render(<AuthNotificationListener />)

        expect(toast.success).toHaveBeenCalledWith("success", {
            description: "loginSuccess",
            closeButton: true,
        })
        expect(sessionStorage.getItem(AUTH_NOTIFICATION_STORAGE_KEY)).toBeNull()
    })

    it("skips showing login toast if notification is 'login' but path ends with /login", () => {
        sessionStorage.setItem(AUTH_NOTIFICATION_STORAGE_KEY, "login")
        vi.mocked(usePathname).mockReturnValue("/auth/login")

        render(<AuthNotificationListener />)

        expect(toast.success).not.toHaveBeenCalled()
        expect(sessionStorage.getItem(AUTH_NOTIFICATION_STORAGE_KEY)).toBe(
            "login",
        )
    })

    it("shows logout toast when notification is 'logout'", () => {
        sessionStorage.setItem(AUTH_NOTIFICATION_STORAGE_KEY, "logout")
        vi.mocked(usePathname).mockReturnValue("/home")

        render(<AuthNotificationListener />)

        expect(toast.success).toHaveBeenCalledWith("success", {
            description: "logoutSuccess",
            closeButton: true,
        })
        expect(sessionStorage.getItem(AUTH_NOTIFICATION_STORAGE_KEY)).toBeNull()
    })
})
