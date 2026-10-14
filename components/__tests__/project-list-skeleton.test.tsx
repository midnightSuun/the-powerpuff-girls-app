import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProjectListSkeleton } from "../project-list-skeleton"

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-testid="skeleton" className={className} />
    ),
}))

describe("ProjectListSkeleton", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders with default rows (4 rows) and search bar skeleton", () => {
        const { container } = render(<ProjectListSkeleton />)

        const root = container.firstChild as HTMLElement
        expect(root).toBeInTheDocument()
        expect(root).toHaveAttribute("aria-busy", "true")
        expect(root).toHaveClass("space-y-3")
        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(21)
    })

    it("renders custom number of rows correctly", () => {
        const rows = 2

        render(<ProjectListSkeleton rows={rows} />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(11)
    })
})
