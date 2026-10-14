import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteLanguageModal } from "../hooks/use-delete-language-modal"

describe("useDeleteLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("initializes with default values", () => {
        const { result } = renderHook(() =>
            useDeleteLanguageModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBeNull()
        expect(typeof result.current.handleConfirm).toBe("function")
    })

    it("successfully calls onConfirm and onClose when handleConfirm is triggered", async () => {
        mockOnConfirm.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useDeleteLanguageModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it("handles error correctly and sets error message when onConfirm fails", async () => {
        const customError = new Error("Delete failed")
        mockOnConfirm.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useDeleteLanguageModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBe("Delete failed")
    })

    it("falls back to translation key when non-Error object is thrown", async () => {
        mockOnConfirm.mockRejectedValueOnce("Unknown error string")

        const { result } = renderHook(() =>
            useDeleteLanguageModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBe("errors.failed")
    })
})
