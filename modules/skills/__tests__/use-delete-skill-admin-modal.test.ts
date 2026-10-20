import { act, renderHook } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteSkillAdminModal } from "../hooks/use-delete-skill-admin-modal"

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

describe("useDeleteSkillAdminModal", () => {
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

    it("initializes with default values", () => {
        const { result } = renderHook(() =>
            useDeleteSkillAdminModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBeNull()
        expect(typeof result.current.handleConfirm).toBe("function")
    })

    it("handles successful deletion confirmation", async () => {
        mockOnConfirm.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useDeleteSkillAdminModal({
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

        mockOnConfirm.mockRejectedValueOnce(new Error("Delete failed"))

        const { result } = renderHook(() =>
            useDeleteSkillAdminModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("deleteError")
        expect(result.current.isDeleting).toBe(false)

        consoleErrorSpy.mockRestore()
    })
})
