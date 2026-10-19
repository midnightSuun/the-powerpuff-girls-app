import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AdminDataTable, type Column } from "../admin-data-table"

const mockToggleSort = vi.fn()
vi.mock("@/hooks/use-column-sort", () => ({
    useColumnSort: () => ({
        sortBy: "name",
        sortOrder: "asc",
        toggleSort: mockToggleSort,
    }),
}))

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            edit: "Edit",
            delete: "Delete",
        }
        return translations[key] || key
    },
}))

vi.mock("@/components/header-toolbar-action", () => ({
    useHeaderToolbarAction: vi.fn(),
}))

vi.mock("@/components/ui/list-management-buttons", () => ({
    AddItemButton: ({
        label,
        onClick,
    }: {
        label: string
        onClick: () => void
    }) => (
        <button type="button" onClick={onClick} data-testid="create-button">
            {label}
        </button>
    ),
}))

vi.mock("@/components/search-input", () => ({
    SearchInput: ({ search }: { search?: string }) => (
        <div data-testid="search-input" data-search={search} />
    ),
}))

vi.mock("../search-input", () => ({
    SearchInput: ({ search }: { search?: string }) => (
        <div data-testid="search-input" data-search={search} />
    ),
}))

vi.mock("../sort-arrow", () => ({
    SortArrow: ({ descending }: { descending: boolean }) => (
        <span data-testid="sort-arrow" data-descending={String(descending)} />
    ),
}))

type TestItem = {
    id: number
    name: string
    role: string
}

const mockColumns: Column<TestItem>[] = [
    {
        key: "name",
        label: "Name",
        sortable: true,
    },
    {
        key: "role",
        label: "Role",
    },
]

const mockData: TestItem[] = [
    { id: 1, name: "Alice", role: "Developer" },
    { id: 2, name: "Bob", role: "Designer" },
]

describe("AdminDataTable", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders headers and data rows correctly", () => {
        render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                getSearchableString={(item) => item.name}
                getSortValue={(item, key) =>
                    key === "name" ? item.name : item.role
                }
            />,
        )

        expect(screen.getByText("Name")).toBeInTheDocument()
        expect(screen.getByText("Role")).toBeInTheDocument()
        expect(screen.getByText("Alice")).toBeInTheDocument()
        expect(screen.getByText("Developer")).toBeInTheDocument()
        expect(screen.getByText("Bob")).toBeInTheDocument()
        expect(screen.getByText("Designer")).toBeInTheDocument()
    })

    it("renders empty message when data is empty", () => {
        render(
            <AdminDataTable
                data={[]}
                columns={mockColumns}
                emptyMessage="No data found"
            />,
        )

        expect(screen.getByText("No data found")).toBeInTheDocument()
    })

    it("filters data based on search query", () => {
        render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                search="alice"
                getSearchableString={(item) => item.name}
            />,
        )

        expect(screen.getByText("Alice")).toBeInTheDocument()
        expect(screen.queryByText("Bob")).not.toBeInTheDocument()
    })

    it("toggles sort when clicking on a sortable column header", () => {
        render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                getSortValue={(item, key) =>
                    key === "name" ? item.name : item.role
                }
            />,
        )

        const sortableHeader = screen.getByText("Name")
        fireEvent.click(sortableHeader)

        expect(mockToggleSort).toHaveBeenCalledWith("name")
    })

    it("opens action menu and triggers edit and delete callbacks", () => {
        const onEditClick = vi.fn()
        const onDeleteClick = vi.fn()

        render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
            />,
        )

        const menuButtons = screen.getAllByRole("button", {
            name: /Actions for/i,
        })
        fireEvent.click(menuButtons[0])

        expect(screen.getByText("Edit")).toBeInTheDocument()
        expect(screen.getByText("Delete")).toBeInTheDocument()

        fireEvent.click(screen.getByText("Edit"))
        expect(onEditClick).toHaveBeenCalledWith(mockData[0])

        fireEvent.click(menuButtons[0])
        fireEvent.click(screen.getByText("Delete"))
        expect(onDeleteClick).toHaveBeenCalledWith(mockData[0])
    })

    it("renders create button and search input when configured", () => {
        const onCreateClick = vi.fn()

        render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                showSearchInput={true}
                createButtonLabel="Add New"
                onCreateClick={onCreateClick}
            />,
        )

        expect(screen.getByTestId("search-input")).toBeInTheDocument()
        const createButton = screen.getByTestId("create-button")
        expect(createButton).toHaveTextContent("Add New")

        fireEvent.click(createButton)
        expect(onCreateClick).toHaveBeenCalledTimes(1)
    })

    it("opens action menu when clicking menu button", () => {
        render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                onEditClick={() => {}}
            />,
        )

        const menuButtons = screen.getAllByRole("button", {
            name: /Actions for/i,
        })

        // Menu should not be visible initially
        expect(screen.queryByText("Edit")).not.toBeInTheDocument()

        // Click to open menu
        fireEvent.click(menuButtons[0])
        expect(screen.getByText("Edit")).toBeInTheDocument()
    })

    it("renders custom column content using col.render function", () => {
        const customColumns: Column<TestItem>[] = [
            {
                key: "name",
                label: "Name",
                render: (item) => (
                    <span data-testid={`custom-${item.id}`}>
                        {item.name.toUpperCase()}
                    </span>
                ),
            },
        ]

        render(<AdminDataTable data={mockData} columns={customColumns} />)

        expect(screen.getByTestId("custom-1")).toHaveTextContent("ALICE")
        expect(screen.getByTestId("custom-2")).toHaveTextContent("BOB")
    })

    it("triggers re-render when memoized props change in areTablePropsEqual", () => {
        const { rerender } = render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                emptyMessage="Initial empty"
            />,
        )

        expect(screen.getByText("Alice")).toBeInTheDocument()

        rerender(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                emptyMessage="Updated empty"
            />,
        )

        expect(screen.getByText("Alice")).toBeInTheDocument()
    })

    it("returns false in areTablePropsEqual when columns keys change", () => {
        const { rerender } = render(
            <AdminDataTable
                data={mockData}
                columns={[{ key: "name", label: "Name" }]}
            />,
        )

        expect(screen.getByText("Name")).toBeInTheDocument()

        rerender(
            <AdminDataTable
                data={mockData}
                columns={[{ key: "role", label: "Role" }]}
            />,
        )

        expect(screen.getByText("Role")).toBeInTheDocument()
        expect(screen.queryByText("Name")).not.toBeInTheDocument()
    })

    it("returns false in areTablePropsEqual when createButtonLabel changes", () => {
        const { rerender } = render(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                showSearchInput={true}
                createButtonLabel="Old Label"
                onCreateClick={() => {}}
            />,
        )

        expect(screen.getByTestId("create-button")).toHaveTextContent(
            "Old Label",
        )

        rerender(
            <AdminDataTable
                data={mockData}
                columns={mockColumns}
                showSearchInput={true}
                createButtonLabel="New Label"
                onCreateClick={() => {}}
            />,
        )

        expect(screen.getByTestId("create-button")).toHaveTextContent(
            "New Label",
        )
    })
})
