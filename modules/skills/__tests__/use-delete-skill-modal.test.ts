import { act, renderHook } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

import { useDeleteSkillsModal } from "../hooks/use-delete-skill-modal"

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

describe("useDeleteSkillsModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useTranslations).mockReturnValue(
            ((key: string) => key) as unknown as ReturnType<
                typeof useTranslations
            >,
        )
    })

    it("initializes with default values and activates body scroll lock", () => {
        const { result } = renderHook(() =>
            useDeleteSkillsModal({
                isOpen: true,
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        expect(result.current.isOpen).toBe(true)
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBeNull()
        expect(useBodyScrollLock).toHaveBeenCalledWith(true)
    })

    it("handles successful deletion confirmation", async () => {
        mockOnConfirm.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useDeleteSkillsModal({
                isOpen: true,
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isDeleting).toBe(false)
    })

    it("handles deletion error gracefully and sets error state", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        mockOnConfirm.mockRejectedValueOnce(new Error("Deletion failed"))

        const { result } = renderHook(() =>
            useDeleteSkillsModal({
                isOpen: true,
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("errors.failed")
        expect(result.current.isDeleting).toBe(false)

        consoleErrorSpy.mockRestore()
    })
})
