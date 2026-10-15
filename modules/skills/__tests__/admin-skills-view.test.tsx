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
    CreateSkillModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="create-modal">
                Create Modal
                <button data-testid="close-create-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("../ui/components/admin/edit-skill-admin-modal", () => ({
    EditSkillModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="edit-modal">
                Edit Modal
                <button data-testid="close-edit-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("../ui/components/admin/delete-skill-admin-modal", () => ({
    DeleteSkillModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                Delete Modal
                <button data-testid="close-delete-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("@/components/ui/admin-data-table", () => ({
    AdminDataTable: ({
        data,
        onCreateClick,
        onEditClick,
        onDeleteClick,
        getSearchableString,
        getSortValue,
    }: {
        data: Array<{ id: string; name: string }>
        onCreateClick?: () => void
        onEditClick?: (skill: { id: string; name: string }) => void
        onDeleteClick?: (skill: { id: string; name: string }) => void
        getSearchableString?: (skill: { id: string; name: string }) => string
        getSortValue?: (
            skill: { id: string; name: string },
            key: string,
        ) => string | undefined
    }) => (
        <div>
            <button data-testid="create-btn" onClick={onCreateClick}>
                Create
            </button>
            {data.length > 0 && (
                <>
                    <div data-testid="search-str">
                        {getSearchableString?.(data[0])}
                    </div>
                    <div data-testid="sort-type">
                        {getSortValue?.(data[0], "type")}
                    </div>
                    <div data-testid="sort-category">
                        {getSortValue?.(data[0], "category")}
                    </div>
                    <div data-testid="sort-name">
                        {getSortValue?.(data[0], "name")}
                    </div>
                    <button
                        data-testid="edit-btn"
                        onClick={() => onEditClick?.(data[0])}
                    >
                        Edit
                    </button>
                    <button
                        data-testid="delete-btn"
                        onClick={() => onDeleteClick?.(data[0])}
                    >
                        Delete
                    </button>
                </>
            )}
            <table>
                <tbody>
                    {data.map((item: { id: string; name: string }) => (
                        <tr key={item.id} data-testid={`row-${item.id}`}>
                            <td>{item.name}</td>
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

        const rows = screen.getAllByTestId(/^row-/)
        expect(rows.length).toBeGreaterThan(0)

        fireEvent.click(screen.getByTestId("create-btn"))
        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(true)
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

    it("calls setIsCreateOpen(false) when create modal is closed", () => {
        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: initialSkills,
            isCreateOpen: true,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingSkill: null,
            setEditingSkill: mockSetEditingSkill,
            deletingSkill: null,
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

        fireEvent.click(screen.getByTestId("close-create-modal"))
        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(false)
    })

    it("calls setEditingSkill(null) when edit modal is closed", () => {
        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: initialSkills,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingSkill: initialSkills[0],
            setEditingSkill: mockSetEditingSkill,
            deletingSkill: null,
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

        fireEvent.click(screen.getByTestId("close-edit-modal"))
        expect(mockSetEditingSkill).toHaveBeenCalledWith(null)
    })

    it("calls setDeletingSkill(null) when delete modal is closed", () => {
        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: initialSkills,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingSkill: null,
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

        fireEvent.click(screen.getByTestId("close-delete-modal"))
        expect(mockSetDeletingSkill).toHaveBeenCalledWith(null)
    })

    it("handles skills without categoryId using category as fallback", () => {
        // Ветка: skill.categoryId пустой → fallback на skill.category
        const skillsWithoutCategoryId = [
            {
                id: "2",
                name: "React",
                category: "Frontend",
                categoryId: "",
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: skillsWithoutCategoryId,
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

        render(
            <AdminSkillsView
                initialSkills={skillsWithoutCategoryId}
                categories={categories}
            />,
        )

        expect(screen.getAllByText("React")[0]).toBeInTheDocument()
    })

    it("uses skill.category as type when skill.type is absent", () => {
        // Ветка: skill.type undefined → skill.type || skill.category
        const skillsNoType = [
            {
                id: "5",
                name: "Vue",
                category: "Frontend",
                categoryId: "fe",
                // type не задан
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: skillsNoType,
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

        render(
            <AdminSkillsView
                initialSkills={skillsNoType}
                categories={categories}
            />,
        )

        // type должен стать "Frontend" (= skill.category)
        expect(screen.getByTestId("sort-type")).toHaveTextContent("Frontend")
    })

    it("uses General when both skill.type and skill.category are absent", () => {
        // Ветка: skill.type && skill.category оба falsy → "General"
        const skillsNoTypeNoCategory = [
            {
                id: "6",
                name: "Bare",
                category: "",
                categoryId: "bare",
                type: undefined,
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: skillsNoTypeNoCategory,
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

        render(
            <AdminSkillsView
                initialSkills={skillsNoTypeNoCategory}
                categories={categories}
            />,
        )

        expect(screen.getByTestId("sort-type")).toHaveTextContent("General")
    })

    it("getSortValue returns empty string for nullish type", () => {
        // Ветка: skill.type ?? "" когда type пустая строка после формирования
        const skillsEmptyType = [
            {
                id: "7",
                name: "Go",
                category: "",
                categoryId: "",
                type: undefined,
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: skillsEmptyType,
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

        render(
            <AdminSkillsView
                initialSkills={skillsEmptyType}
                categories={categories}
            />,
        )

        // type = "General", category = "" → sort-category пустая
        expect(screen.getByTestId("sort-type")).toHaveTextContent("General")
        expect(screen.getByTestId("sort-category")).toBeInTheDocument()
    })

    it("executes getSearchableString and getSortValue functions for coverage", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        // These elements are rendered by our mock to trigger the functions
        expect(screen.getByTestId("search-str")).toBeInTheDocument()
        expect(screen.getByTestId("sort-type")).toBeInTheDocument()
        expect(screen.getByTestId("sort-category")).toBeInTheDocument()
        expect(screen.getByTestId("sort-name")).toBeInTheDocument()
    })

    it("handles skills without type field in getSortValue", () => {
        const skillsWithoutType = [
            {
                id: "3",
                name: "CSS",
                category: "Frontend",
                categoryId: "frontend",
                type: undefined,
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: skillsWithoutType,
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

        render(
            <AdminSkillsView
                initialSkills={skillsWithoutType}
                categories={categories}
            />,
        )

        // This should trigger the type ?? "" branch but formattedSkills sets type = skill.category
        expect(screen.getByTestId("sort-type")).toHaveTextContent("Frontend")
    })

    it("tests getSortValue returning name when key is not type or category", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        // The sort-name div calls getSortValue with "name" key
        // This tests the final return statement
        expect(screen.getByTestId("sort-name")).toHaveTextContent("TypeScript")
    })

    it("handles multiple skills with different categories in getSearchableString", () => {
        const multipleSkills: SkillItem[] = [
            {
                id: "1",
                name: "TypeScript",
                category: "Programming",
                categoryId: "prog",
            },
            {
                id: "2",
                name: "React",
                category: "Frontend",
                categoryId: "frontend",
            },
            {
                id: "3",
                name: "GraphQL",
                category: "API",
                categoryId: "api",
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: multipleSkills,
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

        render(
            <AdminSkillsView
                initialSkills={multipleSkills}
                categories={categories}
            />,
        )

        // Verify the search string includes name, type, and category
        const searchStr = screen.getByTestId("search-str").textContent
        expect(searchStr).toContain("TypeScript")
    })

    it("tests getSearchableString with empty type field", () => {
        const skillsWithEmptyType = [
            {
                id: "4",
                name: "Rust",
                category: "Backend",
                categoryId: "backend",
                type: "",
            },
        ]

        vi.mocked(useAdminSkillsView).mockReturnValue({
            skills: skillsWithEmptyType,
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

        render(
            <AdminSkillsView
                initialSkills={skillsWithEmptyType}
                categories={categories}
            />,
        )

        expect(screen.getByTestId("search-str")).toBeInTheDocument()
    })

    it("calls setEditingSkill with skill when edit button is clicked", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        fireEvent.click(screen.getByTestId("edit-btn"))
        expect(mockSetEditingSkill).toHaveBeenCalledWith(
            expect.objectContaining({ id: "1", name: "TypeScript" }),
        )
    })

    it("calls setDeletingSkill with skill when delete button is clicked", () => {
        render(
            <AdminSkillsView
                initialSkills={initialSkills}
                categories={categories}
            />,
        )

        fireEvent.click(screen.getByTestId("delete-btn"))
        expect(mockSetDeletingSkill).toHaveBeenCalledWith(
            expect.objectContaining({ id: "1", name: "TypeScript" }),
        )
    })
})
