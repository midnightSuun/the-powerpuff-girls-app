import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCvDetails } from "../../hooks/use-cv-details"
import type { CvDetailsItem, ProjectOption, UpdateCvDto } from "../../types"
import { CvsDetailsPageView } from "../cvs-details-page-view"

vi.mock("../../hooks/use-cv-details", () => ({
    useCvDetails: vi.fn(),
}))

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => "",
}))

vi.mock("../components/cv-details-form", () => ({
    CvDetailsForm: ({
        cv,
    }: {
        cv: CvDetailsItem
        onUpdate: (data: UpdateCvDto) => Promise<void> | void
    }) => (
        <div data-testid="cv-details-form">
            <span data-testid="form-cv-name">{cv.name}</span>
        </div>
    ),
}))

vi.mock("../components/cv-projects-view", () => ({
    CvProjectsView: ({
        cvId,
        canManageProjects,
    }: {
        cvId: string
        projects: unknown[]
        availableProjects: unknown[]
        canManageProjects: boolean
    }) => (
        <div data-testid="cv-projects-view">
            <span data-testid="projects-cv-id">{cvId}</span>
            <span data-testid="projects-can-manage">
                {String(canManageProjects)}
            </span>
        </div>
    ),
}))

vi.mock("../components/cv-preview", () => ({
    CvPreview: ({ cv }: { cv: CvDetailsItem }) => (
        <div data-testid="cv-preview">
            <span data-testid="preview-cv-name">{cv.name}</span>
        </div>
    ),
}))

describe("CvsDetailsPageView", () => {
    const mockCv: CvDetailsItem = {
        id: "cv-1",
        name: "Senior Software Engineer",
        education: "BSUIR",
        description: "Experienced fullstack developer",
        projects: [],
        skills: [],
        languages: [],
    }

    const mockAvailableProjects: ProjectOption[] = [
        {
            id: "p-1",
            name: "Project Beta",
            internal_name: "Beta",
            description: "Beta description",
            domain: "Fintech",
            environment: ["React"],
        },
    ]

    const mockHandleUpdateAndRefresh = vi.fn()
    const mockOnUpdate = vi.fn()

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCvDetails).mockReturnValue({
            handleUpdateAndRefresh: mockHandleUpdateAndRefresh,
        } as unknown as ReturnType<typeof useCvDetails>)
    })

    afterEach(() => {
        cleanup()
    })

    it("renders CvDetailsForm when activeTab is 'details'", () => {
        render(
            <CvsDetailsPageView
                cv={mockCv}
                activeTab="details"
                onUpdate={mockOnUpdate}
                skillsContent={<div data-testid="skills-node" />}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("cv-details-form")).toBeInTheDocument()
        expect(screen.getByTestId("form-cv-name")).toHaveTextContent(
            "Senior Software Engineer",
        )
        expect(screen.queryByTestId("skills-node")).not.toBeInTheDocument()
    })

    it("renders skillsContent when activeTab is 'skills'", () => {
        render(
            <CvsDetailsPageView
                cv={mockCv}
                activeTab="skills"
                onUpdate={mockOnUpdate}
                skillsContent={<div data-testid="skills-node" />}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("skills-node")).toBeInTheDocument()
        expect(screen.queryByTestId("cv-details-form")).not.toBeInTheDocument()
    })

    it("renders CvProjectsView with correct props when activeTab is 'projects'", () => {
        render(
            <CvsDetailsPageView
                cv={mockCv}
                activeTab="projects"
                onUpdate={mockOnUpdate}
                skillsContent={<div data-testid="skills-node" />}
                availableProjects={mockAvailableProjects}
                canManageProjects={false}
            />,
        )

        expect(screen.getByTestId("cv-projects-view")).toBeInTheDocument()
        expect(screen.getByTestId("projects-cv-id")).toHaveTextContent("cv-1")
        expect(screen.getByTestId("projects-can-manage")).toHaveTextContent(
            "false",
        )
    })

    it("renders CvPreview when activeTab is 'preview'", () => {
        render(
            <CvsDetailsPageView
                cv={mockCv}
                activeTab="preview"
                onUpdate={mockOnUpdate}
                skillsContent={<div data-testid="skills-node" />}
                availableProjects={mockAvailableProjects}
                canManageProjects={true}
            />,
        )

        expect(screen.getByTestId("cv-preview")).toBeInTheDocument()
        expect(screen.getByTestId("preview-cv-name")).toHaveTextContent(
            "Senior Software Engineer",
        )
    })
})
