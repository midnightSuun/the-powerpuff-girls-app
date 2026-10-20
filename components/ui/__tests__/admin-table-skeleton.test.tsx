import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import {
    AdminTableSkeleton,
    type AdminTableSkeletonColumn,
} from "../admin-table-skeleton"

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-testid="skeleton" className={className} />
    ),
}))

const mockColumns: AdminTableSkeletonColumn[] = [
    {
        id: "col-1",
        className: "w-1/2",
        headerClassName: "h-4 w-24",
        cellClassName: "h-6 w-32",
    },
    {
        id: "col-2",
        className: "w-1/2",
        cellClassName: "h-6 w-20",
    },
]

describe("AdminTableSkeleton", () => {
    it("renders with aria-busy attribute and custom container className", () => {
        render(
            <AdminTableSkeleton
                columns={mockColumns}
                className="custom-skeleton-class"
            />,
        )

        const container = document.querySelector('[aria-busy="true"]')
        expect(container).toBeInTheDocument()
        expect(container).toHaveAttribute("aria-busy", "true")
        expect(container).toHaveClass("custom-skeleton-class")
    })

    it("renders correct number of rows and skeletons when showActions is true (default)", () => {
        render(
            <AdminTableSkeleton
                columns={mockColumns}
                rows={2}
                showActions={true}
            />,
        )

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(7)
    })

    it("renders without action column when showActions is false", () => {
        render(
            <AdminTableSkeleton
                columns={mockColumns}
                rows={1}
                showActions={false}
            />,
        )

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(3)
    })

    it("renders default number of rows (8) when rows prop is not provided", () => {
        render(<AdminTableSkeleton columns={mockColumns} showActions={false} />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(1 + 8 * 2)
    })
})
