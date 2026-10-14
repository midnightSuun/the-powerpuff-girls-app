import { renderHook, act } from "@testing-library/react"
import type { ReactNode } from "react"

import {
    BreadcrumbRefreshProvider,
    useBreadcrumbRefresh,
} from "../breadcrumb-refresh"

describe("BreadcrumbRefreshProvider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
    )

    it("provides initial state with revision 0 and null snapshot", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        expect(result.current.revision).toBe(0)
        expect(result.current.snapshot).toBeNull()
    })

    it("increments revision when refreshBreadcrumb is called", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "John Doe",
            })
        })

        expect(result.current.revision).toBe(1)
        expect(result.current.snapshot).toEqual({
            pagePath: "/profile/{id}",
            id: "user-123",
            value: "John Doe",
        })
    })

    it("increments revision multiple times", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "John Doe",
            })
        })

        expect(result.current.revision).toBe(1)

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "Jane Smith",
            })
        })

        expect(result.current.revision).toBe(2)
        expect(result.current.snapshot?.value).toBe("Jane Smith")
    })

    it("updates snapshot with new values", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "John Doe",
            })
        })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-456",
                value: "Jane Smith",
            })
        })

        expect(result.current.snapshot).toEqual({
            pagePath: "/profile/{id}",
            id: "user-456",
            value: "Jane Smith",
        })
    })

    it("allows different page paths in snapshot", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "John Doe",
            })
        })

        expect(result.current.snapshot?.pagePath).toBe("/profile/{id}")

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/cv/{id}",
                id: "cv-789",
                value: "CV Title",
            })
        })

        expect(result.current.snapshot?.pagePath).toBe("/cv/{id}")
        expect(result.current.snapshot?.id).toBe("cv-789")
    })
})

describe("useBreadcrumbRefresh without provider", () => {
    it("returns default values when used outside provider", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh())

        expect(result.current.revision).toBe(0)
        expect(result.current.snapshot).toBeNull()
    })

    it("provides noop refreshBreadcrumb when used outside provider", () => {
        const { result } = renderHook(() => useBreadcrumbRefresh())

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "John Doe",
            })
        })

        expect(result.current.revision).toBe(0)
        expect(result.current.snapshot).toBeNull()
    })

    it("maintains separate state for multiple provider instances", () => {
        const wrapper1 = ({ children }: { children: ReactNode }) => (
            <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
        )

        const wrapper2 = ({ children }: { children: ReactNode }) => (
            <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
        )

        const { result: result1 } = renderHook(() => useBreadcrumbRefresh(), {
            wrapper: wrapper1,
        })
        const { result: result2 } = renderHook(() => useBreadcrumbRefresh(), {
            wrapper: wrapper2,
        })

        act(() => {
            result1.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-1",
                value: "User One",
            })
        })

        expect(result1.current.revision).toBe(1)
        expect(result2.current.revision).toBe(0)
    })

    it("handles rapid successive refreshes correctly", () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
        )

        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-1",
                value: "First",
            })
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-2",
                value: "Second",
            })
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-3",
                value: "Third",
            })
        })

        expect(result.current.revision).toBe(3)
        expect(result.current.snapshot?.value).toBe("Third")
    })

    it("preserves referential equality of refreshBreadcrumb", () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
        )

        const { result, rerender } = renderHook(() => useBreadcrumbRefresh(), {
            wrapper,
        })

        const firstRefresh = result.current.refreshBreadcrumb

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-1",
                value: "User",
            })
        })

        rerender()

        expect(result.current.refreshBreadcrumb).toBe(firstRefresh)
    })

    it("handles empty string values in snapshot", () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
        )

        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "",
            })
        })

        expect(result.current.snapshot?.value).toBe("")
    })

    it("handles special characters in snapshot values", () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <BreadcrumbRefreshProvider>{children}</BreadcrumbRefreshProvider>
        )

        const { result } = renderHook(() => useBreadcrumbRefresh(), { wrapper })

        const specialValue = "User <>&\"'/123"

        act(() => {
            result.current.refreshBreadcrumb({
                pagePath: "/profile/{id}",
                id: "user-123",
                value: specialValue,
            })
        })

        expect(result.current.snapshot?.value).toBe(specialValue)
    })
})
