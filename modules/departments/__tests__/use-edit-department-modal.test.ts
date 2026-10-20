import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useEditDepartmentModal } from "../hooks/use-edit-department-modal"

describe("useEditDepartmentModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const mockDepartment = {
        id: "dept-1",
        name: "Engineering",
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with department name and valid state", () => {
        const { result } = renderHook(() =>
            useEditDepartmentModal({
                isOpen: true,
                department: mockDepartment,
                existingNames: ["Engineering", "HR"],
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        expect(result.current.name).toBe("Engineering")
        expect(result.current.inlineError).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(true)
    })

    it("detects duplicate names excluding current department name", async () => {
        const { result } = renderHook(() =>
            useEditDepartmentModal({
                isOpen: true,
                department: mockDepartment,
                existingNames: ["Engineering", "HR"],
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        expect(result.current.inlineError).toBeNull()
        expect(result.current.isValid).toBe(true)

        await act(async () => {
            result.current.setName("hr")
        })

        expect(result.current.inlineError).toBe("alreadyExists")
        expect(result.current.isValid).toBe(false)
    })

    it("resets/updates state when department changes or modal re-opens", () => {
        const { result, rerender } = renderHook(
            ({ isOpen, dept }) =>
                useEditDepartmentModal({
                    isOpen,
                    department: dept,
                    existingNames: [],
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            { initialProps: { isOpen: true, dept: mockDepartment } },
        )

        act(() => {
            result.current.setName("Modified Name")
        })
        expect(result.current.name).toBe("Modified Name")

        const newDepartment = { id: "dept-2", name: "Marketing" }
        rerender({ isOpen: true, dept: newDepartment })

        expect(result.current.name).toBe("Marketing")
        expect(result.current.error).toBeNull()
    })

    it("submits successfully, calls onUpdate with trimmed name, and closes modal", async () => {
        mockOnUpdate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useEditDepartmentModal({
                isOpen: true,
                department: mockDepartment,
                existingNames: [],
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            result.current.setName("  Updated Engineering  ")
        })

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnUpdate).toHaveBeenCalledWith("dept-1", {
            name: "Updated Engineering",
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("does nothing on submit if department is null or invalid", async () => {
        const { result } = renderHook(() =>
            useEditDepartmentModal({
                isOpen: true,
                department: null,
                existingNames: [],
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnUpdate).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it("handles update error and sets error state", async () => {
        const errorMessage = "Update failed"
        mockOnUpdate.mockRejectedValueOnce(new Error(errorMessage))

        const { result } = renderHook(() =>
            useEditDepartmentModal({
                isOpen: true,
                department: mockDepartment,
                existingNames: [],
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(result.current.error).toBe(errorMessage)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })
})
