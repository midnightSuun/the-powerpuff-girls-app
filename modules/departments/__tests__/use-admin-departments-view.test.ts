import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
import {
    createAdminDepartment,
    deleteAdminDepartment,
    updateAdminDepartment,
} from "@/modules/departments/api/departments"

import { useAdminDepartmentsView } from "../hooks/use-admin-departments-view"

vi.mock("@/hooks/use-admin-crud-state", () => ({
    useAdminCrudState: vi.fn(),
}))

vi.mock("@/modules/departments/api/departments", () => ({
    createAdminDepartment: vi.fn(),
    updateAdminDepartment: vi.fn(),
    deleteAdminDepartment: vi.fn(),
}))

describe("useAdminDepartmentsView", () => {
    const mockInitialDepartments = [
        { id: "dept-1", name: "Engineering" },
        { id: "dept-2", name: "HR" },
    ]

    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingItem = vi.fn()
    const mockSetDeletingItem = vi.fn()

    const mockCrudReturn = {
        items: mockInitialDepartments,
        isCreateOpen: false,
        setIsCreateOpen: mockSetIsCreateOpen,
        editingItem: null,
        setEditingItem: mockSetEditingItem,
        deletingItem: null,
        setDeletingItem: mockSetDeletingItem,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAdminCrudState).mockReturnValue(
            mockCrudReturn as unknown as ReturnType<typeof useAdminCrudState>,
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes and returns correct state and handlers", () => {
        const { result } = renderHook(() =>
            useAdminDepartmentsView({
                initialDepartments: mockInitialDepartments,
            }),
        )

        expect(useAdminCrudState).toHaveBeenCalledWith(mockInitialDepartments)
        expect(result.current.departments).toEqual(mockInitialDepartments)
        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingDepartment).toBeNull()
        expect(result.current.deletingDepartment).toBeNull()
    })

    describe("handleCreate", () => {
        it("calls createAdminDepartment and closes create modal", async () => {
            vi.mocked(createAdminDepartment).mockResolvedValueOnce({
                id: "dept-3",
                name: "Marketing",
            } as Awaited<ReturnType<typeof createAdminDepartment>>)

            const { result } = renderHook(() =>
                useAdminDepartmentsView({
                    initialDepartments: mockInitialDepartments,
                }),
            )

            await act(async () => {
                await result.current.handleCreate({ name: "Marketing" })
            })

            expect(createAdminDepartment).toHaveBeenCalledWith({
                name: "Marketing",
            })
            expect(mockSetIsCreateOpen).toHaveBeenCalledWith(false)
        })
    })

    describe("handleUpdate", () => {
        it("calls updateAdminDepartment with departmentId and name, then clears editing item", async () => {
            vi.mocked(updateAdminDepartment).mockResolvedValueOnce({
                id: "dept-1",
                name: "Updated Engineering",
            } as Awaited<ReturnType<typeof updateAdminDepartment>>)

            const { result } = renderHook(() =>
                useAdminDepartmentsView({
                    initialDepartments: mockInitialDepartments,
                }),
            )

            await act(async () => {
                await result.current.handleUpdate("dept-1", {
                    name: "Updated Engineering",
                })
            })

            expect(updateAdminDepartment).toHaveBeenCalledWith({
                departmentId: "dept-1",
                name: "Updated Engineering",
            })
            expect(mockSetEditingItem).toHaveBeenCalledWith(null)
        })
    })

    describe("handleDeleteConfirm", () => {
        it("calls deleteAdminDepartment when deletingItem exists and clears deleting item", async () => {
            const deletingDept = { id: "dept-1", name: "Engineering" }
            vi.mocked(useAdminCrudState).mockReturnValue({
                ...mockCrudReturn,
                deletingItem: deletingDept,
            } as unknown as ReturnType<typeof useAdminCrudState>)

            vi.mocked(deleteAdminDepartment).mockResolvedValueOnce({
                affected: 1,
            } as unknown as Awaited<ReturnType<typeof deleteAdminDepartment>>)

            const { result } = renderHook(() =>
                useAdminDepartmentsView({
                    initialDepartments: mockInitialDepartments,
                }),
            )

            await act(async () => {
                await result.current.handleDeleteConfirm()
            })

            expect(deleteAdminDepartment).toHaveBeenCalledWith({
                departmentId: "dept-1",
            })
            expect(mockSetDeletingItem).toHaveBeenCalledWith(null)
        })

        it("does nothing when deletingItem is null", async () => {
            const { result } = renderHook(() =>
                useAdminDepartmentsView({
                    initialDepartments: mockInitialDepartments,
                }),
            )

            await act(async () => {
                await result.current.handleDeleteConfirm()
            })

            expect(deleteAdminDepartment).not.toHaveBeenCalled()
            expect(mockSetDeletingItem).not.toHaveBeenCalled()
        })
    })
})
