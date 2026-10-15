import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { CvDetailsItem } from "@/modules/cvs/types"

import { useCvPreview } from "../../hooks/use-cv-preview"
import { CvPreview } from "../components/cv-preview"

vi.mock("../../hooks/use-cv-preview", () => ({
    useCvPreview: vi.fn(),
}))

vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        onClick,
        className,
    }: {
        children: React.ReactNode
        onClick?: () => void
        className?: string
        type?: string
        variant?: string
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={className}
            data-testid="export-pdf-button"
        >
            {children}
        </button>
    ),
}))

describe("CvPreview", () => {
    const mockCv: CvDetailsItem = {
        id: "cv-1",
        name: "Veranika Kantsavaya",
        education: "BSUIR",
        description: "Software Engineering Student",
        projects: [
            {
                id: "proj-1",
                name: "Hcare CRM",
                internal_name: "HCare",
                description: "Healthcare CRM system",
                domain: "Healthcare",
                start_date: "2026-09-01T00:00:00.000Z",
                end_date: null,
                roles: ["Frontend Developer"],
                responsibilities: ["Developed SPA", "Integrated API"],
                environment: ["React", "TypeScript", "Tailwind"],
                project: { id: "p-1" },
            },
        ],
        skills: [{ name: "React", mastery: "Advanced" }],
        languages: [{ name: "English", proficiency: "C1" }],
    }

    const mockT = vi.fn((key: string) => key)
    const mockGetFormattedPeriod = vi.fn(() => "Sep 2026 — Present")
    const mockGetMasteryLabel = vi.fn(() => "Advanced")
    const mockGetLanguageProficiencyLabel = vi.fn(() => "Advanced (C1)")

    const defaultHookReturn = {
        t: mockT,
        projects: mockCv.projects,
        skills: mockCv.skills,
        languages: mockCv.languages,
        domains: ["Healthcare", "Fintech"],
        categories: new Map([["Frontend", mockCv.skills]]),
        getFormattedPeriod: mockGetFormattedPeriod,
        getMasteryLabel: mockGetMasteryLabel,
        getLanguageProficiencyLabel: mockGetLanguageProficiencyLabel,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCvPreview).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useCvPreview>,
        )
        if (typeof window.print !== "function") {
            Object.defineProperty(window, "print", {
                configurable: true,
                writable: true,
                value: vi.fn(),
            })
        } else {
            vi.spyOn(window, "print").mockImplementation(() => {})
        }
    })

    afterEach(() => {
        cleanup()
    })

    it("renders CV header information correctly", () => {
        render(<CvPreview cv={mockCv} />)

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Veranika Kantsavaya",
        )
        expect(screen.getAllByText("BSUIR")[0]).toBeInTheDocument()
    })

    it("triggers window.print when export PDF button is clicked", async () => {
        const user = userEvent.setup()
        render(<CvPreview cv={mockCv} />)

        const exportButton = screen.getByTestId("export-pdf-button")
        await user.click(exportButton)

        expect(window.print).toHaveBeenCalledTimes(1)
    })

    it("renders sidebar details like languages, domains, and education", () => {
        render(<CvPreview cv={mockCv} />)

        expect(screen.getByText("English — Advanced (C1)")).toBeInTheDocument()
        expect(screen.getByText("Healthcare, Fintech")).toBeInTheDocument()
    })

    it("renders profile description or fallback when missing", () => {
        render(<CvPreview cv={mockCv} />)

        expect(
            screen.getByText("Software Engineering Student"),
        ).toBeInTheDocument()
    })

    it("renders project details correctly", () => {
        render(<CvPreview cv={mockCv} />)

        expect(screen.getByText("Hcare CRM")).toBeInTheDocument()
        expect(screen.getByText("Healthcare CRM system")).toBeInTheDocument()
        expect(screen.getByText("Frontend Developer")).toBeInTheDocument()
        expect(screen.getByText("Developed SPA")).toBeInTheDocument()
        expect(
            screen.getByText("React, TypeScript, Tailwind"),
        ).toBeInTheDocument()
        expect(screen.getByText("Sep 2026 — Present")).toBeInTheDocument()
    })

    it("renders professional skills table with categories and masteries", () => {
        render(<CvPreview cv={mockCv} />)

        expect(screen.getByText("Frontend")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("Advanced")).toBeInTheDocument()
    })

    it("renders noDescription fallback when description is empty", () => {
        vi.mocked(useCvPreview).mockReturnValue({
            ...defaultHookReturn,
            projects: [],
            skills: [],
            languages: [],
            domains: [],
            categories: new Map(),
        } as unknown as ReturnType<typeof useCvPreview>)

        const emptyCv: CvDetailsItem = {
            ...mockCv,
            description: "",
        }

        render(<CvPreview cv={emptyCv} />)

        expect(screen.getByText("noDescription")).toBeInTheDocument()
        expect(screen.getByText("noSkills")).toBeInTheDocument()
    })

    it("renders correctly when education is missing and category has multiple skills", () => {
        const multipleSkills = [
            { name: "React", mastery: "Advanced" },
            { name: "TypeScript", mastery: "Advanced" },
        ]

        vi.mocked(useCvPreview).mockReturnValue({
            ...defaultHookReturn,
            categories: new Map([["Frontend", multipleSkills]]),
        } as unknown as ReturnType<typeof useCvPreview>)

        const cvWithoutEdu: CvDetailsItem = {
            ...mockCv,
            education: "",
        }

        render(<CvPreview cv={cvWithoutEdu} />)

        expect(screen.queryByText("BSUIR")).not.toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })

    it("renders projects without domain, description, roles, responsibilities, or environment", () => {
        const minimalProject = [
            {
                id: "proj-2",
                name: "Minimal Project",
                internal_name: "MinProj",
                description: "",
                domain: "",
                start_date: "2026-01-01T00:00:00.000Z",
                end_date: null,
                roles: [],
                responsibilities: [],
                environment: [],
                project: { id: "p-2" },
            },
        ]

        vi.mocked(useCvPreview).mockReturnValue({
            ...defaultHookReturn,
            projects: minimalProject,
        } as unknown as ReturnType<typeof useCvPreview>)

        render(<CvPreview cv={mockCv} />)

        expect(screen.getByText("Minimal Project")).toBeInTheDocument()
        expect(
            screen.queryByText("Healthcare CRM system"),
        ).not.toBeInTheDocument()
    })
})
