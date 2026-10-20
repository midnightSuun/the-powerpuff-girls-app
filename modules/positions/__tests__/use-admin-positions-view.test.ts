import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    createAdminPosition,
    deleteAdminPosition,
    updateAdminPosition,
} from "@/modules/positions/api/positions"

import {
    AdminPositionItem,
    useAdminPositionsView,
} from "../hooks/use-admin-positions-view"

vi.mock("@/modules/positions/api/positions", () => ({
    createAdminPosition: vi.fn(),
    updateAdminPosition: vi.fn(),
    deleteAdminPosition: vi.fn(),
}))

describe("useAdminPositionsView", () => {
    const initialPositions: AdminPositionItem[] = [
        { id: "1", name: "Frontend Developer" },
        { id: "2", name: "Backend Developer" },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("initializes with default values and provided positions", () => {
        const { result } = renderHook(() =>
            useAdminPositionsView({ initialPositions }),
        )

        expect(result.current.positions).toEqual(initialPositions)
        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingPosition).toBeNull()
        expect(result.current.deletingPosition).toBeNull()
    })

    it("handles position creation successfully and closes create modal", async () => {
        vi.mocked(createAdminPosition).mockResolvedValueOnce({
            id: "3",
            name: "QA Engineer",
        } as unknown as Awaited<ReturnType<typeof createAdminPosition>>)

        const { result } = renderHook(() =>
            useAdminPositionsView({ initialPositions }),
        )

        act(() => {
            result.current.setIsCreateOpen(true)
        })
        expect(result.current.isCreateOpen).toBe(true)

        await act(async () => {
            await result.current.handleCreate({ name: "QA Engineer" })
        })

        expect(createAdminPosition).toHaveBeenCalledTimes(1)
        expect(createAdminPosition).toHaveBeenCalledWith({
            name: "QA Engineer",
        })
        expect(result.current.isCreateOpen).toBe(false)
    })

    it("handles position update successfully and clears editing state", async () => {
        vi.mocked(updateAdminPosition).mockResolvedValueOnce({
            id: "1",
            name: "Senior Frontend",
        } as unknown as Awaited<ReturnType<typeof updateAdminPosition>>)

        const { result } = renderHook(() =>
            useAdminPositionsView({ initialPositions }),
        )

        act(() => {
            result.current.setEditingPosition(initialPositions[0])
        })
        expect(result.current.editingPosition).toEqual(initialPositions[0])

        await act(async () => {
            await result.current.handleUpdate("1", { name: "Senior Frontend" })
        })

        expect(updateAdminPosition).toHaveBeenCalledTimes(1)
        expect(updateAdminPosition).toHaveBeenCalledWith({
            positionId: "1",
            name: "Senior Frontend",
        })
        expect(result.current.editingPosition).toBeNull()
    })

    it("handles position deletion confirmation successfully when deletingItem is present", async () => {
        vi.mocked(deleteAdminPosition).mockResolvedValueOnce({
            success: true,
        } as unknown as Awaited<ReturnType<typeof deleteAdminPosition>>)

        const { result } = renderHook(() =>
            useAdminPositionsView({ initialPositions }),
        )

        act(() => {
            result.current.setDeletingPosition(initialPositions[0])
        })
        expect(result.current.deletingPosition).toEqual(initialPositions[0])

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteAdminPosition).toHaveBeenCalledTimes(1)
        expect(deleteAdminPosition).toHaveBeenCalledWith({ positionId: "1" })
        expect(result.current.deletingPosition).toBeNull()
    })

    it("does not call deleteAdminPosition if deletingItem is null", async () => {
        const { result } = renderHook(() =>
            useAdminPositionsView({ initialPositions }),
        )

        expect(result.current.deletingPosition).toBeNull()

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteAdminPosition).not.toHaveBeenCalled()
    })
})
