import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useAdminSkillsView } from "@/modules/skills/hooks/use-admin-skills-view"

import { AdminSkillsView } from "../ui/components/admin/admin-skills-view"

interface SkillItem {
    id: string
    name: string
    category: string
    categoryId: string
}

vi.mock("@/modules/skills/hooks/use-admin-skills-view", () => ({
    useAdminSkillsView: vi.fn(),
}))

vi.mock("../ui/components/admin/create-skill-modal", () => ({
    CreateSkillModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="create-modal">Create Modal</div> : null,
}))

vi.mock("../ui/components/admin/edit-skill-admin-modal", () => ({
    EditSkillModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="edit-modal">Edit Modal</div> : null,
}))

vi.mock("../ui/components/admin/delete-skill-admin-modal", () => ({
    DeleteSkillModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="delete-modal">Delete Modal</div> : null,
}))

vi.mock("@/components/ui/admin-data-table", () => ({
    AdminDataTable: ({
        data,
        onCreateClick,
        onEditClick,
        onDeleteClick,
    }: {
        data: SkillItem[]
        onCreateClick: () => void
        onEditClick: (item: SkillItem) => void
        onDeleteClick: (item: SkillItem) => void
    }) => (
        <div>
            <button data-testid="create-btn" onClick={onCreateClick}>
                Create
            </button>
            <table>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.id} data-testid={`row-${item.id}`}>
                            <td>{item.name}</td>
                            <td>{item.category}</td>
                            <td>
                                <button
                                    data-testid={`edit-${item.id}`}
                                    onClick={() => onEditClick(item)}
                                >
                                    Edit
                                </button>
                                <button
                                    data-testid={`delete-${item.id}`}
                                    onClick={() => onDeleteClick(item)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ),
}))

describe("AdminSkillsView", () => {
    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingSkill = vi.fn()
    const mockSetDeletingSkill = vi.fn()
    const mockHandleCreate = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDeleteConfirm = vi.fn()

    const initialSkills: SkillItem[] = [
        {
            id: "1",
            name: "TypeScript",
            category: "Programming",
            categoryId: "prog",
        },
    ]

    const expectedFormattedSkill = {
        id: "1",
        name: "TypeScript",
        category: "categories.prog",
        categoryId: "prog",
        type: "Programming",
    }

    const categories = [{ id: "prog", name: "Programming" }]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: initialSkills,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingSkill: null,
            setEditingSkill: mockSetEditingSkill,
            deletingSkill: null,
            setDeletingSkill: mockSetDeletingSkill,
            handleCreate: mockHandleCreate,
            handleUpdate: mockHandleUpdate,
            handleDeleteConfirm: mockHandleDeleteConfirm,
        })
    })

    it("renders table with formatted skills and triggers create modal", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.getByText("categories.prog")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("create-btn"))
        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(true)
    })

    it("opens edit modal when edit action is triggered on table item", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        fireEvent.click(screen.getByTestId("edit-1"))
        expect(mockSetEditingSkill).toHaveBeenCalledWith(expectedFormattedSkill)
    })

    it("opens delete modal when delete action is triggered on table item", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        fireEvent.click(screen.getByTestId("delete-1"))
        expect(mockSetDeletingSkill).toHaveBeenCalledWith(
            expectedFormattedSkill,
        )
    })

    it("renders create, edit, and delete modals when their respective states are active", () => {
        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: initialSkills,
            isCreateOpen: true,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingSkill: initialSkills[0],
            setEditingSkill: mockSetEditingSkill,
            deletingSkill: initialSkills[0],
            setDeletingSkill: mockSetDeletingSkill,
            handleCreate: mockHandleCreate,
            handleUpdate: mockHandleUpdate,
            handleDeleteConfirm: mockHandleDeleteConfirm,
        })

        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        expect(screen.getByTestId("create-modal")).toBeInTheDocument()
        expect(screen.getByTestId("edit-modal")).toBeInTheDocument()
        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    })
})
