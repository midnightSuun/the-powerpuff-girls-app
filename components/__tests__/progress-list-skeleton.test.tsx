import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProgressListSkeleton } from "../progress-list-skeleton"

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-testid="skeleton" className={className} />
    ),
}))

describe("ProgressListSkeleton", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders with default props (2 groups, 6 items each, non-compact layout)", () => {
        const { container } = render(<ProgressListSkeleton />)

        const root = container.firstChild as HTMLElement
        expect(root).toBeInTheDocument()
        expect(root).toHaveAttribute("aria-busy", "true")
        expect(root).toHaveClass("w-full max-w-6xl px-6 py-6 lg:pl-50")
        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(26)
    })

    it("applies compact layout classes when compact prop is true", () => {
        const { container } = render(<ProgressListSkeleton compact />)

        const root = container.firstChild as HTMLElement
        expect(root).toHaveClass("mx-auto w-full max-w-275")
        expect(root).not.toHaveClass("lg:pl-50")
    })

    it("renders custom number of groups and items correctly", () => {
        const groups = 3
        const items = 4

        render(<ProgressListSkeleton groups={groups} items={items} />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(27)
    })
})
