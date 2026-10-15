import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useColumnSort } from "../use-column-sort"

describe("useColumnSort", () => {
    it("starts on the default column in ascending order", () => {
        const { result } = renderHook(() => useColumnSort("name"))

        expect(result.current.sortBy).toBe("name")
        expect(result.current.sortOrder).toBe("asc")
    })

    it("accepts a custom initial order", () => {
        const { result } = renderHook(() => useColumnSort("email", "desc"))

        expect(result.current.sortBy).toBe("email")
        expect(result.current.sortOrder).toBe("desc")
    })

    it("toggles the active column between ascending and descending", () => {
        const { result } = renderHook(() => useColumnSort("name"))

        act(() => {
            result.current.toggleSort("name")
        })

        expect(result.current.sortBy).toBe("name")
        expect(result.current.sortOrder).toBe("desc")

        act(() => {
            result.current.toggleSort("name")
        })

        expect(result.current.sortOrder).toBe("asc")
    })

    it("selects another column in ascending order", () => {
        const { result } = renderHook(() =>
            useColumnSort<"name" | "email">("name", "desc"),
        )

        act(() => {
            result.current.toggleSort("email")
        })

        expect(result.current.sortBy).toBe("email")
        expect(result.current.sortOrder).toBe("asc")
    })
})
