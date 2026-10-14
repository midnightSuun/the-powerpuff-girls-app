import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useAdminCrudState } from "../use-admin-crud-state"

interface TestItem {
    id: string | number
    name: string
}

describe("useAdminCrudState", () => {
    const initialMockItems: TestItem[] = [
        { id: 1, name: "Item One" },
        { id: 2, name: "Item Two" },
    ]

    it("initializes with default values and initial items", () => {
        const { result } = renderHook(() =>
            useAdminCrudState<TestItem>(initialMockItems),
        )

        expect(result.current.items).toEqual(initialMockItems)
        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingItem).toBeNull()
        expect(result.current.deletingItem).toBeNull()
    })

    it("syncs items when initialItems prop changes", () => {
        const { result, rerender } = renderHook(
            (props: { items: TestItem[] }) =>
                useAdminCrudState<TestItem>(props.items),
            { initialProps: { items: initialMockItems } },
        )

        expect(result.current.items).toEqual(initialMockItems)

        const newInitialItems: TestItem[] = [{ id: 3, name: "Item Three" }]
        rerender({ items: newInitialItems })

        expect(result.current.items).toEqual(newInitialItems)
    })

    it("adds a new item correctly", () => {
        const { result } = renderHook(() =>
            useAdminCrudState<TestItem>(initialMockItems),
        )

        act(() => {
            result.current.addItem({ id: 3, name: "Item Three" })
        })

        expect(result.current.items).toHaveLength(3)
        expect(result.current.items[2]).toEqual({ id: 3, name: "Item Three" })
    })

    it("updates an existing item with partial fields", () => {
        const { result } = renderHook(() =>
            useAdminCrudState<TestItem>(initialMockItems),
        )

        act(() => {
            result.current.updateItem(1, { name: "Updated Item One" })
        })

        expect(result.current.items[0]).toEqual({
            id: 1,
            name: "Updated Item One",
        })
        expect(result.current.items[1]).toEqual(initialMockItems[1])
    })

    it("removes an item by id", () => {
        const { result } = renderHook(() =>
            useAdminCrudState<TestItem>(initialMockItems),
        )

        act(() => {
            result.current.removeItem(1)
        })

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]).toEqual({ id: 2, name: "Item Two" })
    })

    it("manages modal states correctly (create, edit, delete)", () => {
        const { result } = renderHook(() =>
            useAdminCrudState<TestItem>(initialMockItems),
        )

        act(() => {
            result.current.setIsCreateOpen(true)
        })
        expect(result.current.isCreateOpen).toBe(true)

        act(() => {
            result.current.setEditingItem(initialMockItems[0])
        })
        expect(result.current.editingItem).toEqual(initialMockItems[0])

        act(() => {
            result.current.setDeletingItem(initialMockItems[1])
        })
        expect(result.current.deletingItem).toEqual(initialMockItems[1])

        act(() => {
            result.current.closeModal()
        })

        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingItem).toBeNull()
        expect(result.current.deletingItem).toBeNull()
    })
})
