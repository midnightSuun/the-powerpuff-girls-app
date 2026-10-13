import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
    type AdminPositionItem,
    useAdminPositionsView,
} from "@/modules/positions/hooks/use-admin-positions-view"

import { AdminPositionsView } from "../ui/admin-positions-view"

vi.mock("@/modules/positions/hooks/use-admin-positions-view", () => ({
    useAdminPositionsView: vi.fn(),
}))

vi.mock("@/components/ui/admin-name-crud-page", () => ({
    AdminNameCrudPage: ({
        data,
        createButtonLabel,
        onCreateClick,
        onEditClick,
        onDeleteClick,
    }: {
        data: AdminPositionItem[]
        createButtonLabel: string
        onCreateClick: () => void
        onEditClick: (item: AdminPositionItem) => void
        onDeleteClick: (item: AdminPositionItem) => void
    }) => (
        <div data-testid="admin-name-crud-page">
            <button onClick={onCreateClick}>{createButtonLabel}</button>
            {data.map((item) => (
                <div key={item.id} data-testid={`position-item-${item.id}`}>
                    <span>{item.name}</span>
                    <button
                        onClick={() => onEditClick(item)}
                        data-testid={`edit-${item.id}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDeleteClick(item)}
                        data-testid={`delete-${item.id}`}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    ),
}))

vi.mock("../ui/create-position-admin-modal", () => ({
    CreatePositionModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="create-modal">Create Modal</div> : null,
}))

vi.mock("../ui/edit-position-admin-modal", () => ({
    EditPositionModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="edit-modal">Edit Modal</div> : null,
}))

vi.mock("../ui/delete-position-admin-modal", () => ({
    DeletePositionModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="delete-modal">Delete Modal</div> : null,
}))

type HookReturnType = ReturnType<typeof useAdminPositionsView>

describe("AdminPositionsView", () => {
    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingPosition = vi.fn()
    const mockSetDeletingPosition = vi.fn()
    const mockHandleCreate = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDeleteConfirm = vi.fn()

    const initialPositions: AdminPositionItem[] = [
        { id: "1", name: "Frontend Developer" },
        { id: "2", name: "Backend Developer" },
    ]

    const defaultHookValues: HookReturnType = {
        positions: initialPositions,
        isCreateOpen: false,
        setIsCreateOpen: mockSetIsCreateOpen,
        editingPosition: null,
        setEditingPosition: mockSetEditingPosition,
        deletingPosition: null,
        setDeletingPosition: mockSetDeletingPosition,
        handleCreate: mockHandleCreate,
        handleUpdate: mockHandleUpdate,
        handleDeleteConfirm: mockHandleDeleteConfirm,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAdminPositionsView).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders positions and triggers create modal when create button is clicked", () => {
        render(<AdminPositionsView initialPositions={initialPositions} />)

        expect(screen.getByTestId("admin-name-crud-page")).toBeInTheDocument()
        expect(screen.getByText("Frontend Developer")).toBeInTheDocument()
        expect(screen.getByText("Backend Developer")).toBeInTheDocument()

        const createButton = screen.getByText("createButton")
        fireEvent.click(createButton)

        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(true)
    })

    it("triggers edit modal state when edit button is clicked", () => {
        render(<AdminPositionsView initialPositions={initialPositions} />)

        const editButton = screen.getByTestId("edit-1")
        fireEvent.click(editButton)

        expect(mockSetEditingPosition).toHaveBeenCalledWith(initialPositions[0])
    })

    it("triggers delete modal state when delete button is clicked", () => {
        render(<AdminPositionsView initialPositions={initialPositions} />)

        const deleteButton = screen.getByTestId("delete-1")
        fireEvent.click(deleteButton)

        expect(mockSetDeletingPosition).toHaveBeenCalledWith(
            initialPositions[0],
        )
    })

    it("renders create modal when isCreateOpen is true", () => {
        vi.mocked(useAdminPositionsView).mockReturnValue({
            ...defaultHookValues,
            isCreateOpen: true,
        })

        render(<AdminPositionsView initialPositions={initialPositions} />)

        expect(screen.getByTestId("create-modal")).toBeInTheDocument()
    })

    it("renders edit modal when editingPosition is set", () => {
        vi.mocked(useAdminPositionsView).mockReturnValue({
            ...defaultHookValues,
            editingPosition: initialPositions[0],
        })

        render(<AdminPositionsView initialPositions={initialPositions} />)

        expect(screen.getByTestId("edit-modal")).toBeInTheDocument()
    })

    it("renders delete modal when deletingPosition is set", () => {
        vi.mocked(useAdminPositionsView).mockReturnValue({
            ...defaultHookValues,
            deletingPosition: initialPositions[0],
        })

        render(<AdminPositionsView initialPositions={initialPositions} />)

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    })
})
