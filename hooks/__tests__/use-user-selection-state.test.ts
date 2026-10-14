import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useUserSelectionState } from "../use-user-selection-state"

describe("useUserSelectionState", () => {
    it("initializes with default values", () => {
        const { result } = renderHook(() => useUserSelectionState<string>())

        expect(result.current.isSelectionMode).toBe(false)
        expect(result.current.selectedItems).toEqual([])
    })

    it("toggles selection mode correctly", () => {
        const { result } = renderHook(() => useUserSelectionState<string>())

        act(() => {
            result.current.setIsSelectionMode(true)
        })

        expect(result.current.isSelectionMode).toBe(true)

        act(() => {
            result.current.setIsSelectionMode(false)
        })

        expect(result.current.isSelectionMode).toBe(false)
    })

    it("adds item to selection if not present and removes if already present", () => {
        const { result } = renderHook(() => useUserSelectionState<string>())

        act(() => {
            result.current.toggleSelection("item-1")
        })

        expect(result.current.selectedItems).toEqual(["item-1"])

        act(() => {
            result.current.toggleSelection("item-2")
        })

        expect(result.current.selectedItems).toEqual(["item-1", "item-2"])

        act(() => {
            result.current.toggleSelection("item-1")
        })

        expect(result.current.selectedItems).toEqual(["item-2"])
    })

    it("clears selection items correctly", () => {
        const { result } = renderHook(() => useUserSelectionState<string>())

        act(() => {
            result.current.setSelectedItems(["item-1", "item-2"])
        })

        expect(result.current.selectedItems).toHaveLength(2)

        act(() => {
            result.current.clearSelection()
        })

        expect(result.current.selectedItems).toEqual([])
    })

    it("resets selection mode and items correctly", () => {
        const { result } = renderHook(() => useUserSelectionState<string>())

        act(() => {
            result.current.setIsSelectionMode(true)
            result.current.setSelectedItems(["item-1", "item-2"])
        })

        expect(result.current.isSelectionMode).toBe(true)
        expect(result.current.selectedItems).toHaveLength(2)

        act(() => {
            result.current.resetSelection()
        })

        expect(result.current.isSelectionMode).toBe(false)
        expect(result.current.selectedItems).toEqual([])
    })
})
