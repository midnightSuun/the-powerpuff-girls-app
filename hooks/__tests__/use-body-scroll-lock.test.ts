import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { useBodyScrollLock } from "../use-body-scroll-lock"

describe("useBodyScrollLock", () => {
    beforeEach(() => {
        document.body.style.overflow = ""
    })

    afterEach(() => {
        document.body.style.overflow = ""
    })

    it("does not lock scroll when isLocked is false", () => {
        renderHook(() => useBodyScrollLock(false))

        expect(document.body.style.overflow).toBe("")
    })

    it("locks scroll (overflow: hidden) when isLocked is true", () => {
        renderHook(() => useBodyScrollLock(true))

        expect(document.body.style.overflow).toBe("hidden")
    })

    it("removes scroll lock when component unmounts", () => {
        const { unmount } = renderHook(() => useBodyScrollLock(true))

        expect(document.body.style.overflow).toBe("hidden")

        unmount()

        expect(document.body.style.overflow).toBe("")
    })

    it("tackles lock state changes from true to false correctly", () => {
        const { rerender } = renderHook(
            (props: { isLocked: boolean }) => useBodyScrollLock(props.isLocked),
            { initialProps: { isLocked: true } },
        )

        expect(document.body.style.overflow).toBe("hidden")

        rerender({ isLocked: false })

        expect(document.body.style.overflow).toBe("")
    })

    it("maintains lock state when multiple hooks are active and one unmounts", () => {
        const hook1 = renderHook(() => useBodyScrollLock(true))
        const hook2 = renderHook(() => useBodyScrollLock(true))

        expect(document.body.style.overflow).toBe("hidden")

        hook1.unmount()

        expect(document.body.style.overflow).toBe("hidden")

        hook2.unmount()

        expect(document.body.style.overflow).toBe("")
    })
})
