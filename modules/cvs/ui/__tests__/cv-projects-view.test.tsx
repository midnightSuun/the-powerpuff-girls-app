import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { useCvProjects } from "../../hooks/use-cv-projects"
import { CvProjectsView } from "../components/cv-projects-view"

vi.mock("../../hooks/use-cv-projects", () => ({
    useCvProjects: vi.fn(),
}))

vi.mock("next/navigation", () => ({
    useSearchParams: () => ({
        get: vi.fn().mockReturnValue(""),
    }),
    usePathname: () => "",
    useRouter: () => ({
        push: vi.fn(),
    }),
}))

vi.mock("@/components/projects-table-view", () => ({
    ProjectsTableView: ({
        projects,
        canManage,
        onAdd,
        onEdit,
        onDelete,
        deleteError,
    }: {
        projects: CvProjectItem[]
        canManage: boolean
        addLabel: string
        onAdd: () => void
        onEdit: (project: CvProjectItem) => void
        onDelete: (project: CvProjectItem) => void
        deleteError?: string | null
    }) => (
        <div data-testid="projects-table-view">
            <div data-testid="can-manage">{String(canManage)}</div>
            {deleteError && <div data-testid="delete-error">{deleteError}</div>}
            <button
                type="button"
                onClick={onAdd}
                data-testid="add-project-button"
            >
                Add Project
            </button>
            {projects.map((p) => (
                <div key={p.id} data-testid={`project-row-${p.id}`}>
                    <span>{p.name}</span>
                    <button
                        type="button"
                        onClick={() => onEdit(p)}
                        data-testid={`edit-project-${p.id}`}
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(p)}
                        data-testid={`delete-project-${p.id}`}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    ),
}))

vi.mock("../components/cv-project-form-modal", () => ({
    CvProjectFormModal: ({
        isOpen,
        onClose,
        onSaved,
    }: {
        isOpen: boolean
        onClose: () => void
        onSaved: () => void
    }) =>
        isOpen ? (
            <div data-testid="cv-project-form-modal">
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="modal-close"
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onSaved}
                    data-testid="modal-save"
                >
                    Save
                </button>
            </div>
        ) : null,
}))

describe("CvProjectsView", () => {
    const mockProjects: CvProjectItem[] = [
        {
            id: "proj-1",
            name: "Alpha Project",
            internal_name: "Alpha",
            description: "Desc",
            domain: "Fintech",
            start_date: "2026-01-01",
            end_date: null,
            roles: ["Developer"],
            responsibilities: ["Coding"],
            environment: ["React"],
            project: { id: "p-1" },
        },
    ]

    const mockAvailableProjects: ProjectOption[] = [
        {
            id: "p-2",
            name: "Beta Project",
            internal_name: "Beta",
            description: "Beta desc",
            domain: "Healthcare",
            environment: ["Node"],
        },
    ]

    const mockSetIsAddOpen = vi.fn()
    const mockSetEditingProject = vi.fn()
    const mockSetRemoveError = vi.fn()
    const mockHandleRemove = vi.fn()
    const mockRefresh = vi.fn()

    const defaultHookReturn = {
        isAddOpen: false,
        setIsAddOpen: mockSetIsAddOpen,
        editingProject: null,
        setEditingProject: mockSetEditingProject,
        isRemoving: false,
        removeError: null,
        setRemoveError: mockSetRemoveError,
        existingProjectIds: ["p-1"],
        availableToAdd: true,
        handleRemove: mockHandleRemove,
        refresh: mockRefresh,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCvProjects).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useCvProjects>,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders projects table view with correct props and management rights", () => {
        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("projects-table-view")).toBeInTheDocument()
        expect(screen.getByTestId("can-manage")).toHaveTextContent("true")
        expect(screen.getByText("Alpha Project")).toBeInTheDocument()
    })

    it("triggers setIsAddOpen when add project button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        const addButton = screen.getByTestId("add-project-button")
        await user.click(addButton)

        expect(mockSetIsAddOpen).toHaveBeenCalledWith(true)
    })

    it("triggers setEditingProject when edit action is invoked on a project", async () => {
        const user = userEvent.setup()
        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        const editButton = screen.getByTestId("edit-project-proj-1")
        await user.click(editButton)

        expect(mockSetEditingProject).toHaveBeenCalledWith(mockProjects[0])
    })

    it("triggers handleRemove when delete action is invoked", async () => {
        const user = userEvent.setup()
        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        const deleteButton = screen.getByTestId("delete-project-proj-1")
        await user.click(deleteButton)

        expect(mockHandleRemove).toHaveBeenCalledWith(mockProjects[0])
    })

    it("renders CvProjectFormModal when isAddOpen is true", () => {
        vi.mocked(useCvProjects).mockReturnValue({
            ...defaultHookReturn,
            isAddOpen: true,
        } as unknown as ReturnType<typeof useCvProjects>)

        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("cv-project-form-modal")).toBeInTheDocument()
    })

    it("renders CvProjectFormModal when editingProject is provided and handles close/save", async () => {
        const user = userEvent.setup()
        vi.mocked(useCvProjects).mockReturnValue({
            ...defaultHookReturn,
            editingProject: mockProjects[0],
        } as unknown as ReturnType<typeof useCvProjects>)

        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("cv-project-form-modal")).toBeInTheDocument()

        const saveButton = screen.getByTestId("modal-save")
        await user.click(saveButton)
        expect(mockRefresh).toHaveBeenCalledTimes(1)

        const closeButton = screen.getByTestId("modal-close")
        await user.click(closeButton)
        expect(mockSetIsAddOpen).toHaveBeenCalledWith(false)
        expect(mockSetEditingProject).toHaveBeenCalledWith(null)
    })

    it("does not render CvProjectFormModal when canManageProjects is false", () => {
        vi.mocked(useCvProjects).mockReturnValue({
            ...defaultHookReturn,
            isAddOpen: true,
        } as unknown as ReturnType<typeof useCvProjects>)

        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={false}
            />,
        )

        expect(
            screen.queryByTestId("cv-project-form-modal"),
        ).not.toBeInTheDocument()
    })

    it("displays delete error message when present", () => {
        vi.mocked(useCvProjects).mockReturnValue({
            ...defaultHookReturn,
            removeError: "Failed to delete project",
        } as unknown as ReturnType<typeof useCvProjects>)

        render(
            <CvProjectsView
                cvId="cv-1"
                projects={mockProjects}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("delete-error")).toHaveTextContent(
            "Failed to delete project",
        )
    })
})
