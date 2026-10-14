import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    ProjectsTableView,
    type ProjectTableItem,
} from "../projects-table-view"

const mockToggleSort = vi.fn()
let mockVisibleItems: ProjectTableItem[] = []
let mockItemToRemove: ProjectTableItem | null = null
const mockSetItemToRemove = vi.fn((item: ProjectTableItem | null) => {
    mockItemToRemove = item
})

vi.mock("@/hooks/use-projects-table", () => ({
    useProjectsTable: () => ({
        sortField: "name",
        sortDirection: "asc",
        itemToRemove: mockItemToRemove,
        setItemToRemove: mockSetItemToRemove,
        visibleItems: mockVisibleItems,
        toggleSort: mockToggleSort,
    }),
}))

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

vi.mock("@/components/search-input", () => ({
    SearchInput: () => <div data-testid="search-input" />,
}))

vi.mock("@/components/ui/list-management-buttons", () => ({
    AddItemButton: ({
        label,
        onClick,
        disabled,
    }: {
        label: string
        onClick: () => void
        disabled?: boolean
    }) => (
        <button
            data-testid="add-item-button"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    ),
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        onConfirm,
        onClose,
    }: {
        isOpen: boolean
        title: string
        onConfirm: () => void
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                <span>{title}</span>
                <button data-testid="confirm-delete" onClick={onConfirm}>
                    Confirm
                </button>
                <button data-testid="close-delete" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    DropdownMenuTrigger: ({
        children,
        "aria-label": ariaLabel,
        onClick,
    }: {
        children: React.ReactNode
        "aria-label"?: string
        onClick?: () => void
    }) => (
        <button
            aria-label={ariaLabel}
            onClick={onClick}
            data-testid="dropdown-trigger"
        >
            {children}
        </button>
    ),
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-content">{children}</div>
    ),
    DropdownMenuItem: ({
        children,
        onClick,
    }: {
        children: React.ReactNode
        onClick?: () => void
    }) => (
        <button onClick={onClick} data-testid="dropdown-item">
            {children}
        </button>
    ),
}))

const sampleProjects: ProjectTableItem[] = [
    {
        id: "p1",
        name: "Alpha Project",
        domain: "Fintech",
        description: "Banking application",
        start_date: "2024-01-01",
        end_date: "2024-06-01",
        environment: ["React", "TypeScript"],
    },
]

describe("ProjectsTableView", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockVisibleItems = sampleProjects
        mockItemToRemove = null
    })

    it("renders table with project items and toolbar correctly", () => {
        render(
            <ProjectsTableView
                projects={sampleProjects}
                canManage={true}
                addLabel="Add Project"
                showSearchInput={true}
                onAdd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={async () => true}
            />,
        )

        expect(screen.getByTestId("search-input")).toBeInTheDocument()
        expect(screen.getByTestId("add-item-button")).toHaveTextContent(
            "Add Project",
        )
        expect(screen.getByText("Alpha Project")).toBeInTheDocument()
        expect(screen.getByText("Fintech")).toBeInTheDocument()
        expect(screen.getByText("Banking application")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })

    it("shows empty message when visible items array is empty", () => {
        mockVisibleItems = []

        render(
            <ProjectsTableView
                projects={[]}
                canManage={false}
                emptyMessage="Custom Empty State"
            />,
        )

        expect(screen.getByText("Custom Empty State")).toBeInTheDocument()
    })

    it("triggers edit and delete actions when user can manage", async () => {
        const onEditMock = vi.fn()
        const onDeleteMock = vi.fn().mockResolvedValue(true)

        render(
            <ProjectsTableView
                projects={sampleProjects}
                canManage={true}
                onAdd={vi.fn()}
                onEdit={onEditMock}
                onDelete={onDeleteMock}
            />,
        )

        const trigger = screen.getByTestId("dropdown-trigger")
        fireEvent.click(trigger)

        const menuItems = screen.getAllByTestId("dropdown-item")
        fireEvent.click(menuItems[0])

        expect(onEditMock).toHaveBeenCalledWith(sampleProjects[0])

        fireEvent.click(menuItems[1])
        expect(mockSetItemToRemove).toHaveBeenCalledWith(sampleProjects[0])
    })

    it("handles delete confirmation inside DeleteModal", async () => {
        mockItemToRemove = sampleProjects[0]
        const onDeleteMock = vi.fn().mockResolvedValue(true)

        render(
            <ProjectsTableView
                projects={sampleProjects}
                canManage={true}
                onAdd={vi.fn()}
                onEdit={vi.fn()}
                onDelete={onDeleteMock}
            />,
        )

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("confirm-delete"))

        await waitFor(() => {
            expect(onDeleteMock).toHaveBeenCalledWith(sampleProjects[0])
            expect(mockSetItemToRemove).toHaveBeenCalledWith(null)
        })
    })
})
