import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"

import { UpdateCvDto } from "../../types"
import { useCvDetails } from "../use-cv-details"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

describe("useCvDetails", () => {
    const mockRefresh = vi.fn()
    const mockSuccessNotification = vi.fn()

    const mockPayload: UpdateCvDto = {
        name: "New Name",
        education: "New Education",
        description: "New Description",
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRefresh,
        } as unknown as ReturnType<typeof useRouter>)

        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
        } as unknown as ReturnType<typeof useActionNotifications>)
    })

    it("successfully calls onUpdate, triggers success notification, and refreshes router", async () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined)
        const { result } = renderHook(() => useCvDetails({ onUpdate }))

        await act(async () => {
            await result.current.handleUpdateAndRefresh(mockPayload)
        })

        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith(mockPayload)
        expect(mockSuccessNotification).toHaveBeenCalledTimes(1)
        expect(mockSuccessNotification).toHaveBeenCalledWith("updated")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
})
