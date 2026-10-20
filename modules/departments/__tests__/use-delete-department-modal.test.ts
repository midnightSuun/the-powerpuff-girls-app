import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteDepartmentModal } from "../hooks/use-delete-department-modal"

describe("useDeleteDepartmentModal", () => {
    const mockOnConfirm = vi.fn()
    const mockOnClose = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with default states", () => {
        const { result } = renderHook(() =>
            useDeleteDepartmentModal({
                onConfirm: mockOnConfirm,
                onClose: mockOnClose,
            }),
        )

        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBeNull()
        expect(typeof result.current.handleConfirm).toBe("function")
    })

    it("handles successful deletion and closes modal", async () => {
        mockOnConfirm.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useDeleteDepartmentModal({
                onConfirm: mockOnConfirm,
                onClose: mockOnClose,
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

    it("handles error when confirmation fails with Error instance", async () => {
        const errorMessage = "Department is in use"
        mockOnConfirm.mockRejectedValueOnce(new Error(errorMessage))

        const { result } = renderHook(() =>
            useDeleteDepartmentModal({
                onConfirm: mockOnConfirm,
                onClose: mockOnClose,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe(errorMessage)
        expect(result.current.isDeleting).toBe(false)
    })

    it("handles error when confirmation fails with non-Error object using translation fallback", async () => {
        mockOnConfirm.mockRejectedValueOnce("Unknown error string")

        const { result } = renderHook(() =>
            useDeleteDepartmentModal({
                onConfirm: mockOnConfirm,
                onClose: mockOnClose,
            }),
        )

        await act(async () => {
            await result.current.handleConfirm()
        })

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("inUseError")
        expect(result.current.isDeleting).toBe(false)
    })
})
