import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAdminDepartmentsView } from "@/modules/departments/hooks/use-admin-departments-view"

import { AdminDepartmentsView } from "../ui/admin-departments-view"

vi.mock("@/modules/departments/hooks/use-admin-departments-view", () => ({
    useAdminDepartmentsView: vi.fn(),
}))

vi.mock("@/components/ui/admin-name-crud-page", () => ({
    AdminNameCrudPage: ({
        data,
        createButtonLabel,
        onCreateClick,
        onEditClick,
        onDeleteClick,
        children,
    }: {
        data: Array<{ id: string; name: string }>
        createButtonLabel: string
        onCreateClick: () => void
        onEditClick: (item: { id: string; name: string }) => void
        onDeleteClick: (item: { id: string; name: string }) => void
        children: React.ReactNode
    }) => (
        <div data-testid="admin-name-crud-page">
            <button type="button" onClick={onCreateClick}>
                {createButtonLabel}
            </button>
            <ul>
                {data.map((item) => (
                    <li key={item.id} data-testid={`department-row-${item.id}`}>
                        <span>{item.name}</span>
                        <button
                            type="button"
                            onClick={() => onEditClick(item)}
                            data-testid={`edit-${item.id}`}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => onDeleteClick(item)}
                            data-testid={`delete-${item.id}`}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            {children}
        </div>
    ),
}))

vi.mock("../ui/create-department-admin-modal", () => ({
    CreateDepartmentModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="create-modal">
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="close-create-modal"
                >
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("../ui/edit-department-admin-modal", () => ({
    EditDepartmentModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="edit-modal">
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="close-edit-modal"
                >
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("../ui/delete-department-admin-modal", () => ({
    DeleteDepartmentModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="close-delete-modal"
                >
                    Close
                </button>
            </div>
        ) : null,
}))

describe("AdminDepartmentsView", () => {
    const mockInitialDepartments = [
        { id: "dept-1", name: "Engineering" },
        { id: "dept-2", name: "HR" },
    ]

    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingDepartment = vi.fn()
    const mockSetDeletingDepartment = vi.fn()
    const mockHandleCreate = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDeleteConfirm = vi.fn()

    const defaultHookReturn: ReturnType<typeof useAdminDepartmentsView> = {
        departments: mockInitialDepartments,
        isCreateOpen: false,
        setIsCreateOpen: mockSetIsCreateOpen,
        editingDepartment: null,
        setEditingDepartment: mockSetEditingDepartment,
        deletingDepartment: null,
        setDeletingDepartment: mockSetDeletingDepartment,
        handleCreate: mockHandleCreate,
        handleUpdate: mockHandleUpdate,
        handleDeleteConfirm: mockHandleDeleteConfirm,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useAdminDepartmentsView).mockReturnValue(defaultHookReturn)
    })

    afterEach(() => {
        cleanup()
    })

    it("renders the departments list and crud layout correctly", () => {
        render(
            <AdminDepartmentsView
                initialDepartments={mockInitialDepartments}
            />,
        )

        expect(screen.getByTestId("admin-name-crud-page")).toBeInTheDocument()
        expect(screen.getByText("Engineering")).toBeInTheDocument()
        expect(screen.getByText("HR")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "createButton" }),
        ).toBeInTheDocument()
    })

    it("triggers setIsCreateOpen when create button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <AdminDepartmentsView
                initialDepartments={mockInitialDepartments}
            />,
        )

        const createButton = screen.getByRole("button", {
            name: "createButton",
        })
        await user.click(createButton)

        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(true)
    })

    it("opens edit modal and sets editing department when edit button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <AdminDepartmentsView
                initialDepartments={mockInitialDepartments}
            />,
        )

        const editButton = screen.getByTestId("edit-dept-1")
        await user.click(editButton)

        expect(mockSetEditingDepartment).toHaveBeenCalledWith(
            mockInitialDepartments[0],
        )
    })

    it("opens delete modal and sets deleting department when delete button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <AdminDepartmentsView
                initialDepartments={mockInitialDepartments}
            />,
        )

        const deleteButton = screen.getByTestId("delete-dept-2")
        await user.click(deleteButton)

        expect(mockSetDeletingDepartment).toHaveBeenCalledWith(
            mockInitialDepartments[1],
        )
    })

    it("renders respective modals when state flags are active and handles closing", async () => {
        const user = userEvent.setup()
        vi.mocked(useAdminDepartmentsView).mockReturnValue({
            ...defaultHookReturn,
            isCreateOpen: true,
            editingDepartment: mockInitialDepartments[0],
            deletingDepartment: mockInitialDepartments[1],
        })

        render(
            <AdminDepartmentsView
                initialDepartments={mockInitialDepartments}
            />,
        )

        expect(screen.getByTestId("create-modal")).toBeInTheDocument()
        expect(screen.getByTestId("edit-modal")).toBeInTheDocument()
        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()

        await user.click(screen.getByTestId("close-create-modal"))
        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(false)

        await user.click(screen.getByTestId("close-edit-modal"))
        expect(mockSetEditingDepartment).toHaveBeenCalledWith(null)

        await user.click(screen.getByTestId("close-delete-modal"))
        expect(mockSetDeletingDepartment).toHaveBeenCalledWith(null)
    })
})
