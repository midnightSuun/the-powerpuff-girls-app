import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Skeleton } from "../skeleton"

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Skeleton component", () => {
    it("renders skeleton with default animation and styling", () => {
        render(<Skeleton />)

        const skeleton = document.querySelector('[data-slot="skeleton"]')
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveAttribute("data-slot", "skeleton")
        expect(skeleton).toHaveClass("animate-pulse", "rounded-md", "bg-muted")
    })

    it("applies custom className correctly", () => {
        render(<Skeleton className="h-10 w-full rounded-full" />)

        const skeleton = document.querySelector('[data-slot="skeleton"]')
        expect(skeleton).toHaveClass("h-10", "w-full", "rounded-full")
    })
})
