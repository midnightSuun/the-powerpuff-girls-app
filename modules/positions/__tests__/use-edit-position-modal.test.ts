import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AdminPositionItem } from "../hooks/use-admin-positions-view"
import { useEditPositionModal } from "../hooks/use-edit-position-modal"

describe("useEditPositionModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const samplePosition: AdminPositionItem = {
        id: "1",
        name: "Frontend Developer",
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("initializes with position name when open", () => {
        const { result } = renderHook(() =>
            useEditPositionModal({
                isOpen: true,
                position: samplePosition,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        expect(result.current.name).toBe("Frontend Developer")
        expect(result.current.inlineError).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(true)
    })

    it("synchronizes name when position prop changes", () => {
        const { result, rerender } = renderHook(
            ({ pos }) =>
                useEditPositionModal({
                    isOpen: true,
                    position: pos,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            { initialProps: { pos: samplePosition } },
        )

        expect(result.current.name).toBe("Frontend Developer")

        const newPosition: AdminPositionItem = {
            id: "2",
            name: "Backend Developer",
        }
        rerender({ pos: newPosition })

        expect(result.current.name).toBe("Backend Developer")
    })

    it("detects duplicate name correctly excluding current position name", () => {
        const { result, rerender } = renderHook(
            ({ existingNames }) =>
                useEditPositionModal({
                    isOpen: true,
                    position: samplePosition,
                    existingNames,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            { initialProps: { existingNames: ["Frontend Developer"] } },
        )

        expect(result.current.inlineError).toBeNull()
        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.setName("Backend Developer")
        })

        rerender({ existingNames: ["Frontend Developer", "Backend Developer"] })

        expect(result.current.inlineError).toBe("alreadyExists")
        expect(result.current.isValid).toBe(false)
    })

    it("handles successful update and closes modal", async () => {
        mockOnUpdate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useEditPositionModal({
                isOpen: true,
                position: samplePosition,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        act(() => {
            result.current.setName("   Senior Frontend Developer   ")
        })
        expect(result.current.isValid).toBe(true)

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        expect(mockOnUpdate).toHaveBeenCalledWith("1", {
            name: "Senior Frontend Developer",
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("handles update error correctly when onUpdate throws an Error", async () => {
        const customError = new Error("Update failed on server")
        mockOnUpdate.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useEditPositionModal({
                isOpen: true,
                position: samplePosition,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("Update failed on server")
        expect(result.current.isSubmitting).toBe(false)
    })

    it("falls back to default error message when non-Error object is thrown during update", async () => {
        mockOnUpdate.mockRejectedValueOnce("Unknown string error")

        const { result } = renderHook(() =>
            useEditPositionModal({
                isOpen: true,
                position: samplePosition,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("Failed to update position")
        expect(result.current.isSubmitting).toBe(false)
    })

    it("does not call onUpdate if position is null or form is invalid", async () => {
        const { result } = renderHook(() =>
            useEditPositionModal({
                isOpen: true,
                position: null,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnUpdate).not.toHaveBeenCalled()
    })
})
