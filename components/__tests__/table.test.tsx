import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { type TableColumn, TableComponent } from "../table"

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
        "aria-sort": ariaSort,
    }: {
        children: React.ReactNode
        className?: string
        "aria-sort"?: "ascending" | "descending" | "none" | "other"
    }) => (
        <th className={className} aria-sort={ariaSort}>
            {children}
        </th>
    ),
    TableCell: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <td className={className}>{children}</td>,
}))

vi.mock("@/i18n/navigation", () => ({
    Link: ({
        href,
        children,
        "aria-label": ariaLabel,
    }: {
        href: string
        children: React.ReactNode
        "aria-label"?: string
    }) => (
        <a href={href} aria-label={ariaLabel}>
            {children}
        </a>
    ),
}))

vi.mock("@/components/sort-arrow", () => ({
    SortArrow: ({ descending }: { descending: boolean }) => (
        <span data-testid="sort-arrow" data-descending={String(descending)} />
    ),
}))

type TestUser = {
    id: string
    name: string
    role: string
}

const mockColumns: TableColumn<TestUser>[] = [
    {
        id: "name",
        label: "Name",
        sortKey: "name",
        render: (user) => user.name,
    },
    {
        id: "role",
        label: "Role",
        render: (user) => user.role,
    },
]

const mockData: TestUser[] = [
    { id: "1", name: "Alice", role: "Developer" },
    { id: "2", name: "Bob", role: "Designer" },
]

describe("TableComponent", () => {
    it("renders table headers and data rows correctly", () => {
        render(
            <TableComponent
                data={mockData}
                columns={mockColumns}
                getRowKey={(user) => user.id}
            />,
        )

        expect(screen.getByText("Name")).toBeInTheDocument()
        expect(screen.getByText("Role")).toBeInTheDocument()

        expect(screen.getByText("Alice")).toBeInTheDocument()
        expect(screen.getByText("Developer")).toBeInTheDocument()
        expect(screen.getByText("Bob")).toBeInTheDocument()
        expect(screen.getByText("Designer")).toBeInTheDocument()
    })

    it("renders empty message when data array is empty", () => {
        render(
            <TableComponent
                data={[]}
                columns={mockColumns}
                emptyMessage="No users found"
            />,
        )

        expect(screen.getByText("No users found")).toBeInTheDocument()
    })

    it("handles sorting states and renders SortArrow correctly", () => {
        const getSortHref = (sortKey: string) => `/sort?by=${sortKey}`

        const { rerender } = render(
            <TableComponent
                data={mockData}
                columns={mockColumns}
                sortBy="name"
                sortOrder="asc"
                getSortHref={getSortHref}
            />,
        )

        const nameHeader = screen.getByText("Name").closest("th")
        expect(nameHeader).toHaveAttribute("aria-sort", "ascending")

        const sortArrow = screen.getByTestId("sort-arrow")
        expect(sortArrow).toHaveAttribute("data-descending", "false")

        const roleHeader = screen.getByText("Role").closest("th")
        expect(roleHeader).not.toHaveAttribute("aria-sort")

        rerender(
            <TableComponent
                data={mockData}
                columns={mockColumns}
                sortBy="name"
                sortOrder="desc"
                getSortHref={getSortHref}
            />,
        )

        expect(nameHeader).toHaveAttribute("aria-sort", "descending")
        expect(sortArrow).toHaveAttribute("data-descending", "true")
    })

    it("renders row links when getRowHref is provided", () => {
        render(
            <TableComponent
                data={mockData}
                columns={mockColumns}
                getRowHref={(user) => `/users/${user.id}`}
                getRowLabel={(user) => `View ${user.name}`}
            />,
        )

        const link = screen.getByRole("link", { name: "View Alice" })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute("href", "/users/1")
        expect(link).toHaveTextContent("Alice")
    })
})
