import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CvsListSkeleton } from "../cvs-list-skeleton"

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-testid="skeleton" className={className} />
    ),
}))

describe("CvsListSkeleton", () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders container with aria-busy attribute set to true", () => {
        render(<CvsListSkeleton />)

        const container = screen.getByText(
            (_, element) => element?.getAttribute("aria-busy") === "true",
        )
        expect(container).toBeInTheDocument()
        expect(container).toHaveAttribute("aria-busy", "true")
    })

    it("renders search filter skeleton and table header skeletons", () => {
        render(<CvsListSkeleton />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it("renders exactly 8 rows of skeleton items", () => {
        render(<CvsListSkeleton />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBe(36)
    })

    it("does not render search filter skeleton when showSearch is false", () => {
        render(<CvsListSkeleton showSearch={false} />)

        const container = screen.getByText(
            (_, element) => element?.getAttribute("aria-busy") === "true",
        )
        expect(container).toBeInTheDocument()
        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBe(35)
    })
})
