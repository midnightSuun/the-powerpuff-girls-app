import { renderHook } from "@testing-library/react"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "../use-action-notifications"

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    },
}))

describe("useActionNotifications", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("triggers toast.success with correct mapped action message using global next-intl mock", () => {
        const { result } = renderHook(() => useActionNotifications())

        result.current.success("created")

        expect(toast.success).toHaveBeenCalledTimes(1)
        expect(toast.success).toHaveBeenCalledWith("success", {
            description: "actions.created",
            closeButton: true,
        })
    })

    it("triggers toast.success with fallback string if custom message is provided", () => {
        const { result } = renderHook(() => useActionNotifications())

        result.current.success("Custom success message")

        expect(toast.success).toHaveBeenCalledWith("success", {
            description: "Custom success message",
            closeButton: true,
        })
    })

    it("triggers toast.error with correct mapped action message", () => {
        const { result } = renderHook(() => useActionNotifications())

        result.current.error("deleted")

        expect(toast.error).toHaveBeenCalledTimes(1)
        expect(toast.error).toHaveBeenCalledWith("error", {
            description: "actions.deleted",
            closeButton: true,
        })
    })

    it("triggers toast.warning with correct message description", () => {
        const { result } = renderHook(() => useActionNotifications())

        result.current.warning("Be careful!")

        expect(toast.warning).toHaveBeenCalledTimes(1)
        expect(toast.warning).toHaveBeenCalledWith("warning", {
            description: "Be careful!",
            closeButton: true,
        })
    })

    it("triggers toast.info with correct message description", () => {
        const { result } = renderHook(() => useActionNotifications())

        result.current.info("System update available")

        expect(toast.info).toHaveBeenCalledTimes(1)
        expect(toast.info).toHaveBeenCalledWith("info", {
            description: "System update available",
            closeButton: true,
        })
    })
})
