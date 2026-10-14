import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useIsMobile, useIsTablet } from "../use-mobile"

describe("MediaQuery Hooks", () => {
    let listeners: Record<string, Array<() => void>> = {}
    let matchesState = false

    beforeEach(() => {
        listeners = {}
        matchesState = false

        vi.stubGlobal(
            "matchMedia",
            vi.fn().mockImplementation((query: string) => ({
                matches: matchesState,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(
                    (event: string, callback: () => void) => {
                        if (!listeners[query]) {
                            listeners[query] = []
                        }
                        listeners[query].push(callback)
                    },
                ),
                removeEventListener: vi.fn(
                    (_event: string, callback: () => void) => {
                        if (listeners[query]) {
                            listeners[query] = listeners[query].filter(
                                (cb) => cb !== callback,
                            )
                        }
                    },
                ),
                dispatchEvent: vi.fn(),
            })),
        )
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    const resizeScreen = (query: string, matches: boolean) => {
        matchesState = matches
        vi.mocked(window.matchMedia).mockImplementation((q: string) => ({
            matches: q === query ? matches : false,
            media: q,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((event: string, callback: () => void) => {
                if (!listeners[q]) listeners[q] = []
                listeners[q].push(callback)
            }),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }))

        if (listeners[query]) {
            act(() => {
                listeners[query].forEach((cb) => cb())
            })
        }
    }

    describe("useIsMobile", () => {
        it("returns false initially when screen is large", () => {
            matchesState = false
            const { result } = renderHook(() => useIsMobile())
            expect(result.current).toBe(false)
        })

        it("returns true when screen matches mobile query (< 768px)", () => {
            matchesState = true
            const { result } = renderHook(() => useIsMobile())
            expect(result.current).toBe(true)
        })

        it("updates state correctly when window resizes to mobile", () => {
            matchesState = false
            const { result } = renderHook(() => useIsMobile())
            expect(result.current).toBe(false)

            resizeScreen("(max-width: 767px)", true)
            expect(result.current).toBe(true)
        })
    })

    describe("useIsTablet", () => {
        it("returns false initially when screen is outside tablet range", () => {
            matchesState = false
            const { result } = renderHook(() => useIsTablet())
            expect(result.current).toBe(false)
        })

        it("returns true when screen matches tablet query (768px - 1023px)", () => {
            matchesState = true
            const { result } = renderHook(() => useIsTablet())
            expect(result.current).toBe(true)
        })

        it("updates state correctly when window resizes to tablet", () => {
            matchesState = false
            const { result } = renderHook(() => useIsTablet())
            expect(result.current).toBe(false)

            resizeScreen("(min-width: 768px) and (max-width: 1023px)", true)
            expect(result.current).toBe(true)
        })
    })
})
