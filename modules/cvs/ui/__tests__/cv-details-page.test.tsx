import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getCvDetailsData } from "../../hooks/use-cv-details-data"
import { CvDetailsPage } from "../cv-details-page"

vi.mock("../../hooks/use-cv-details-data", () => ({
    getCvDetailsData: vi.fn(),
}))

vi.mock("@/modules/skills/ui/skills", () => ({
    Skills: ({
        userSkills,
        role,
        compact,
        canManageSkills,
    }: {
        userSkills: { cvId: string; skills: unknown[] }
        role?: string
        compact?: boolean
        canManageSkills: boolean
    }) => (
        <div data-testid="skills-component">
            <span data-testid="skills-cv-id">{userSkills.cvId}</span>
            <span data-testid="skills-role">{role}</span>
            <span data-testid="skills-compact">{String(compact)}</span>
            <span data-testid="skills-can-manage">
                {String(canManageSkills)}
            </span>
        </div>
    ),
}))

vi.mock("@/modules/cvs/ui/cvs-details-page-view", () => ({
    CvsDetailsPageView: ({
        cv,
        activeTab,
        canManageProjects,
        availableProjects,
        skillsContent,
    }: {
        cv: { id: string; name: string }
        activeTab: string
        canManageProjects: boolean
        availableProjects: unknown[]
        skillsContent?: React.ReactNode
    }) => (
        <div data-testid="cv-details-page-view">
            <span data-testid="view-cv-id">{cv.id}</span>
            <span data-testid="view-cv-name">{cv.name}</span>
            <span data-testid="view-active-tab">{activeTab}</span>
            <span data-testid="view-can-manage">
                {String(canManageProjects)}
            </span>
            <span data-testid="view-available-projects-count">
                {availableProjects.length}
            </span>
            {skillsContent}
        </div>
    ),
}))

describe("CvDetailsPage", () => {
    const mockCvData = {
        cv: {
            id: "cv-100",
            name: "Lead React Architect",
            skills: [{ id: "s-1", name: "React" }],
        },
        session: { role: "ADMIN" },
        canManage: true,
        availableProjects: [{ id: "p-1", name: "Project Alpha" }],
        handleUpdate: vi.fn(),
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(getCvDetailsData).mockResolvedValue(
            mockCvData as unknown as Awaited<
                ReturnType<typeof getCvDetailsData>
            >,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("fetches CV details data and renders view with skills component correctly", async () => {
        const ui = await CvDetailsPage({ id: "cv-100", activeTab: "details" })
        render(ui)

        expect(getCvDetailsData).toHaveBeenCalledWith("cv-100")

        expect(screen.getByTestId("cv-details-page-view")).toBeInTheDocument()
        expect(screen.getByTestId("view-cv-id")).toHaveTextContent("cv-100")
        expect(screen.getByTestId("view-cv-name")).toHaveTextContent(
            "Lead React Architect",
        )
        expect(screen.getByTestId("view-active-tab")).toHaveTextContent(
            "details",
        )
        expect(screen.getByTestId("view-can-manage")).toHaveTextContent("true")
        expect(
            screen.getByTestId("view-available-projects-count"),
        ).toHaveTextContent("1")

        expect(screen.getByTestId("skills-component")).toBeInTheDocument()
        expect(screen.getByTestId("skills-cv-id")).toHaveTextContent("cv-100")
        expect(screen.getByTestId("skills-role")).toHaveTextContent("ADMIN")
        expect(screen.getByTestId("skills-compact")).toHaveTextContent("true")
        expect(screen.getByTestId("skills-can-manage")).toHaveTextContent(
            "true",
        )
    })

    it("handles different active tabs and restricted management rights", async () => {
        vi.mocked(getCvDetailsData).mockResolvedValue({
            ...mockCvData,
            canManage: false,
            session: { role: "USER" },
        } as unknown as Awaited<ReturnType<typeof getCvDetailsData>>)

        const ui = await CvDetailsPage({ id: "cv-100", activeTab: "projects" })
        render(ui)

        expect(screen.getByTestId("view-active-tab")).toHaveTextContent(
            "projects",
        )
        expect(screen.getByTestId("view-can-manage")).toHaveTextContent("false")
        expect(screen.getByTestId("skills-can-manage")).toHaveTextContent(
            "false",
        )
        expect(screen.getByTestId("skills-role")).toHaveTextContent("USER")
    })
})
