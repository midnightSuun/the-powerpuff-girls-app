import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TableSkeleton, type TableSkeletonColumn } from "../table-skeleton"

vi.mock("@/components/ui/table", () => ({
    Table: ({ children }: { children: React.ReactNode }) => (
        <table>{children}</table>
    ),
    TableHeader: ({ children }: { children: React.ReactNode }) => (
        <thead>{children}</thead>
    ),
    TableBody: ({ children }: { children: React.ReactNode }) => (
        <tbody>{children}</tbody>
    ),
    TableRow: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <tr className={className}>{children}</tr>,
    TableHead: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <th className={className}>{children}</th>,
    TableCell: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <td className={className}>{children}</td>,
}))

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-testid="skeleton" className={className} />
    ),
}))

const mockColumns: TableSkeletonColumn[] = [
    {
        id: "col-1",
        className: "w-1/2",
        headerClassName: "h-4 w-20",
        cellClassName: "h-6 w-32",
    },
    {
        id: "col-2",
        className: "w-1/2",
        cellClassName: "h-6 w-24",
    },
]

describe("TableSkeleton", () => {
    it("renders with aria-busy attribute and custom container className", () => {
        render(
            <TableSkeleton
                columns={mockColumns}
                className="custom-table-class"
            />,
        )

        const container = document.querySelector('[aria-busy="true"]')
        expect(container).toBeInTheDocument()
        expect(container).toHaveAttribute("aria-busy", "true")
        expect(container).toHaveClass("custom-table-class")
    })

    it("renders correct number of header columns and headers with/without skeleton", () => {
        render(<TableSkeleton columns={mockColumns} rows={2} />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(5)
    })

    it("renders default number of rows (8) when rows prop is not provided", () => {
        render(<TableSkeleton columns={mockColumns} />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons.length).toBe(1 + 8 * 2)
    })

    it("renders custom number of rows when specified", () => {
        render(<TableSkeleton columns={mockColumns} rows={3} />)

        const skeletons = screen.getAllByTestId("skeleton")
        expect(skeletons).toHaveLength(7)
    })
})
