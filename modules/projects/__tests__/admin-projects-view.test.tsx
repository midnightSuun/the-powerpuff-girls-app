import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useHeaderToolbarAction } from "@/components/header-toolbar-action"
import type { ProjectTableItem } from "@/components/projects-table-view"
import { useAdminProjects } from "@/modules/projects/hooks/use-admin-projects"

import { AdminProjectsView } from "../ui/admin-projects-view"

vi.mock("@/components/header-toolbar-action", () => ({
    useHeaderToolbarAction: vi.fn(),
}))

vi.mock("@/modules/projects/hooks/use-admin-projects", () => ({
    useAdminProjects: vi.fn(),
}))

vi.mock("@/components/projects-table-view", () => ({
    ProjectsTableView: ({
        projects,
        onEdit,
        onDelete,
        onDeleteClose,
        isDeleting,
        deleteError,
    }: {
        projects: ProjectTableItem[]
        onEdit: (project: ProjectTableItem) => void
        onDelete: (project: ProjectTableItem) => Promise<boolean>
        onDeleteClose: () => void
        isDeleting: boolean
        deleteError: string | null
    }) => (
        <div data-testid="projects-table-view">
            {isDeleting && (
                <span data-testid="deleting-indicator">Deleting...</span>
            )}
            {deleteError && (
                <span data-testid="delete-error">{deleteError}</span>
            )}
            <button data-testid="delete-error-close" onClick={onDeleteClose}>
                Close Error
            </button>
            {projects.map((project) => (
                <div
                    key={project.id}
                    data-testid={`project-item-${project.id}`}
                >
                    <span>{project.name}</span>
                    <button
                        data-testid={`edit-${project.id}`}
                        onClick={() => onEdit(project)}
                    >
                        Edit
                    </button>
                    <button
                        data-testid={`delete-${project.id}`}
                        onClick={() => onDelete(project)}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    ),
}))

vi.mock("../ui/project-form-modal", () => ({
    ProjectFormModal: ({
        isOpen,
        project,
        onClose,
    }: {
        isOpen: boolean
        project: ProjectTableItem | null
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="project-form-modal">
                <span>
                    {project ? "Edit Project Modal" : "Create Project Modal"}
                </span>
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}))

type AdminProjectsHookReturnType = ReturnType<typeof useAdminProjects>

describe("AdminProjectsView", () => {
    const mockHandleSave = vi.fn()
    const mockHandleDelete = vi.fn()
    const mockSetRemoveError = vi.fn()

    const sampleProjects: ProjectTableItem[] = [
        {
            id: "1",
            name: "Alpha Project",
            domain: "Fintech",
            start_date: "2025-01-01",
            end_date: null,
            description: "Financial system",
            environment: ["React", "Node.js"],
        },
        {
            id: "2",
            name: "Beta Project",
            domain: "Healthcare",
            start_date: "2025-06-01",
            end_date: "2025-12-31",
            description: "Medical portal",
            environment: ["Vue", "Python"],
        },
    ]

    const defaultAdminProjectsValues: AdminProjectsHookReturnType = {
        isRemoving: false,
        removeError: null,
        setRemoveError: mockSetRemoveError,
        handleSave: mockHandleSave,
        handleDelete: mockHandleDelete,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAdminProjects).mockReturnValue(defaultAdminProjectsValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders projects table and registers header toolbar action", () => {
        render(<AdminProjectsView projects={sampleProjects} search="" />)

        expect(useHeaderToolbarAction).toHaveBeenCalledWith(
            "createProject",
            expect.any(Function),
        )
        expect(screen.getByTestId("projects-table-view")).toBeInTheDocument()
        expect(screen.getByText("Alpha Project")).toBeInTheDocument()
        expect(screen.getByText("Beta Project")).toBeInTheDocument()
    })

    it("opens create project modal when header toolbar action is triggered", () => {
        render(<AdminProjectsView projects={sampleProjects} search="" />)

        const toolbarActionCallback = vi.mocked(useHeaderToolbarAction).mock
            .calls[0][1]

        act(() => {
            toolbarActionCallback()
        })

        expect(screen.getByTestId("project-form-modal")).toBeInTheDocument()
        expect(screen.getByText("Create Project Modal")).toBeInTheDocument()
    })

    it("opens edit project modal when edit button is clicked", () => {
        render(<AdminProjectsView projects={sampleProjects} search="" />)

        const editButton = screen.getByTestId("edit-1")
        act(() => {
            fireEvent.click(editButton)
        })

        expect(screen.getByTestId("project-form-modal")).toBeInTheDocument()
        expect(screen.getByText("Edit Project Modal")).toBeInTheDocument()
    })

    it("handles project deletion correctly via table callback", async () => {
        mockHandleDelete.mockResolvedValueOnce(true)

        render(<AdminProjectsView projects={sampleProjects} search="" />)

        const deleteButton = screen.getByTestId("delete-1")
        await act(async () => {
            fireEvent.click(deleteButton)
        })

        expect(mockHandleDelete).toHaveBeenCalledTimes(1)
        expect(mockHandleDelete).toHaveBeenCalledWith(sampleProjects[0])
    })

    it("triggers onDeleteClose callback when error reset is requested", () => {
        vi.mocked(useAdminProjects).mockReturnValue({
            ...defaultAdminProjectsValues,
            removeError: "removeError",
        })

        render(<AdminProjectsView projects={sampleProjects} search="" />)

        expect(screen.getByTestId("delete-error")).toHaveTextContent(
            "removeError",
        )

        const closeErrorButton = screen.getByTestId("delete-error-close")
        fireEvent.click(closeErrorButton)

        expect(mockSetRemoveError).toHaveBeenCalledWith(null)
    })
})
