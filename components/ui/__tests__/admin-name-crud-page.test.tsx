import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { Column } from "@/components/ui/admin-data-table"

import { AdminNameCrudPage } from "../admin-name-crud-page"

vi.mock("@/components/ui/admin-data-table", () => ({
    AdminDataTable: ({
        data,
        columns,
        createButtonLabel,
        emptyMessage,
        getSearchableString,
        getSortValue,
    }: {
        data: Array<{ id: string | number; name: string }>
        columns: Array<{ key: string; label: string }>
        createButtonLabel?: string
        emptyMessage?: string
        getSearchableString?: (item: {
            id: string | number
            name: string
        }) => string
        getSortValue?: (
            item: { id: string | number; name: string },
            key?: string,
        ) => string
    }) => (
        <div data-testid="admin-data-table">
            <div data-testid="table-create-label">{createButtonLabel}</div>
            <div data-testid="table-empty-message">{emptyMessage}</div>
            <div data-testid="table-data-count">{data.length}</div>
            <div>
                {data.map((item) => (
                    <div key={item.id} data-testid="table-item">
                        {getSearchableString
                            ? getSearchableString(item)
                            : item.name}
                        {getSortValue
                            ? ` | Sort: ${getSortValue(item, columns[0]?.key)}`
                            : ""}
                    </div>
                ))}
            </div>
        </div>
    ),
}))

type TestCrudItem = {
    id: number
    name: string
}

const mockColumns: Column<TestCrudItem>[] = [
    {
        key: "name",
        label: "Name",
        sortable: true,
    },
]

const mockData: TestCrudItem[] = [
    { id: 1, name: "Department A" },
    { id: 2, name: "Department B" },
]

describe("AdminNameCrudPage", () => {
    const defaultProps = {
        data: mockData,
        columns: mockColumns,
        createButtonLabel: "Create New",
        emptyMessage: "No records found",
        getItemName: (item: TestCrudItem) => item.name,
        onCreateClick: vi.fn(),
        onEditClick: vi.fn(),
        onDeleteClick: vi.fn(),
    }

    it("renders AdminDataTable with correct props and data", () => {
        render(
            <AdminNameCrudPage {...defaultProps}>
                <div data-testid="child-content">Extra Content</div>
            </AdminNameCrudPage>,
        )

        expect(screen.getByTestId("admin-data-table")).toBeInTheDocument()
        expect(screen.getByTestId("table-create-label")).toHaveTextContent(
            "Create New",
        )
        expect(screen.getByTestId("table-empty-message")).toHaveTextContent(
            "No records found",
        )
        expect(screen.getByTestId("table-data-count")).toHaveTextContent("2")

        const items = screen.getAllByTestId("table-item")
        expect(items[0]).toHaveTextContent("Department A | Sort: Department A")
        expect(items[1]).toHaveTextContent("Department B | Sort: Department B")

        expect(screen.getByTestId("child-content")).toHaveTextContent(
            "Extra Content",
        )
    })

    it("respects memoization when props remain unchanged", () => {
        const { rerender } = render(<AdminNameCrudPage {...defaultProps} />)

        expect(screen.getByTestId("table-data-count")).toHaveTextContent("2")

        rerender(<AdminNameCrudPage {...defaultProps} />)
        expect(screen.getByTestId("admin-data-table")).toBeInTheDocument()
    })
    it("re-renders when memoized props like createButtonLabel or data change", () => {
        const { rerender } = render(
            <AdminNameCrudPage
                {...defaultProps}
                createButtonLabel="Old Label"
            />,
        )

        expect(screen.getByTestId("table-create-label")).toHaveTextContent(
            "Old Label",
        )

        rerender(
            <AdminNameCrudPage
                {...defaultProps}
                createButtonLabel="New Label"
            />,
        )
        expect(screen.getByTestId("table-create-label")).toHaveTextContent(
            "New Label",
        )

        const updatedData = [...mockData, { id: 3, name: "Department C" }]
        rerender(
            <AdminNameCrudPage
                {...defaultProps}
                data={updatedData}
                createButtonLabel="New Label"
            />,
        )
        expect(screen.getByTestId("table-data-count")).toHaveTextContent("3")
    })
})
