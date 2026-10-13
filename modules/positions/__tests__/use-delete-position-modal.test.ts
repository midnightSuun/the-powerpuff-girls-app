import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDeletePositionModal } from "../hooks/use-delete-position-modal"

describe("useDeletePositionModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("initializes with default values", () => {
        const { result } = renderHook(() =>
            useDeletePositionModal({
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
            useDeletePositionModal({
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

    it("handles error correctly and sets error message when onConfirm throws an Error", async () => {
        const customError = new Error("Database deletion failed")
        mockOnConfirm.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useDeletePositionModal({
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
        expect(result.current.error).toBe("Database deletion failed")
    })

    it("falls back to translation key 'inUseError' when non-Error object is thrown", async () => {
        mockOnConfirm.mockRejectedValueOnce("Foreign key constraint error")

        const { result } = renderHook(() =>
            useDeletePositionModal({
                onClose: mockOnClose,
                onConfirm: mockOnConfirm,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBe("inUseError")
    })
})
