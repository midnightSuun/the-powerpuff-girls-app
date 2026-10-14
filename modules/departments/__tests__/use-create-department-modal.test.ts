import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateDepartmentModal } from "../hooks/use-create-department-modal"

describe("useCreateDepartmentModal", () => {
    const mockOnClose = vi.fn()
    const mockOnSubmit = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with empty fields and invalid state", () => {
        const { result } = renderHook(() =>
            useCreateDepartmentModal({
                isOpen: true,
                existingNames: ["HR"],
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.inlineError).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
    })

    it("validates input and detects duplicate names", async () => {
        const { result } = renderHook(
            ({ isOpen }) =>
                useCreateDepartmentModal({
                    isOpen,
                    existingNames: ["Engineering"],
                    onClose: mockOnClose,
                    onSubmit: mockOnSubmit,
                }),
            { initialProps: { isOpen: true } },
        )

        await act(async () => {
            result.current.setName("Marketing")
        })

        expect(result.current.inlineError).toBeNull()
        expect(result.current.isValid).toBe(true)

        await act(async () => {
            result.current.setName("engineering")
        })

        expect(result.current.inlineError).toBe("alreadyExists")
        expect(result.current.isValid).toBe(false)
    })

    it("resets state when modal closes and reopens", () => {
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useCreateDepartmentModal({
                    isOpen,
                    existingNames: [],
                    onClose: mockOnClose,
                    onSubmit: mockOnSubmit,
                }),
            { initialProps: { isOpen: true } },
        )

        act(() => {
            result.current.setName("Some Name")
        })
        expect(result.current.name).toBe("Some Name")

        rerender({ isOpen: false })

        rerender({ isOpen: true })

        expect(result.current.name).toBe("")
        expect(result.current.error).toBeNull()
    })

    it("submits successfully, resets name, and closes modal", async () => {
        mockOnSubmit.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useCreateDepartmentModal({
                isOpen: true,
                existingNames: [],
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        await act(async () => {
            result.current.setName("Sales")
        })

        expect(result.current.isValid).toBe(true)

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnSubmit).toHaveBeenCalledWith({ name: "Sales" })
        expect(result.current.name).toBe("")
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("handles submission error and sets error state", async () => {
        const errorMessage = "Server creation error"
        mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage))

        const { result } = renderHook(() =>
            useCreateDepartmentModal({
                isOpen: true,
                existingNames: [],
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        await act(async () => {
            result.current.setName("Operations")
        })

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(result.current.error).toBe(errorMessage)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })
})
