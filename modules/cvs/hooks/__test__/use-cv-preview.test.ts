import { renderHook } from "@testing-library/react"
import { useLocale, useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery, Proficiency } from "@/gql/generated/graphql"
import type { CvDetailsItem, CvProjectItem } from "@/modules/cvs/types"

import { useCvPreview } from "../use-cv-preview"

vi.mock("next-intl", () => ({
    useLocale: vi.fn(),
    useTranslations: vi.fn(),
}))

describe("useCvPreview", () => {
    const mockT = vi.fn((key: string) => key)
    const mockTSkills = Object.assign(
        vi.fn((key: string) => key),
        {
            has: vi.fn(
                (key: string) =>
                    key === "categories.frontend" ||
                    key === "categories.backend",
            ),
        },
    )
    const mockTLanguages = vi.fn((key: string) => key)

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useLocale).mockReturnValue("en")
        vi.mocked(useTranslations).mockImplementation((namespace?: string) => {
            if (namespace === "CV.preview")
                return mockT as unknown as ReturnType<typeof useTranslations>
            if (namespace === "Skills")
                return mockTSkills as unknown as ReturnType<
                    typeof useTranslations
                >
            if (namespace === "Languages")
                return mockTLanguages as unknown as ReturnType<
                    typeof useTranslations
                >
            return mockT as unknown as ReturnType<typeof useTranslations>
        })
    })

    const baseCv: CvDetailsItem = {
        id: "cv-1",
        name: "John Doe",
        education: "MIT",
        description: "Software Engineer",
        projects: [
            {
                id: "p-1",
                name: "Project A",
                internal_name: "Internal A",
                description: "Desc A",
                domain: "Fintech",
                start_date: "2024-01-01T00:00:00.000Z",
                end_date: "2024-06-01T00:00:00.000Z",
                roles: ["Developer"],
                responsibilities: ["Coding"],
                environment: ["React"],
            } as CvProjectItem,
            {
                id: "p-2",
                name: "Project B",
                internal_name: "Internal B",
                description: "Desc B",
                domain: "Fintech",
                start_date: "2024-07-01T00:00:00.000Z",
                end_date: null,
                roles: ["Lead"],
                responsibilities: ["Architecture"],
                environment: ["Node.js"],
            } as CvProjectItem,
        ],
        skills: [
            {
                name: "React",
                categoryId: "frontend",
                mastery: "Expert" as Mastery,
            },
            {
                name: "Node",
                categoryId: "backend",
                mastery: "Advanced" as Mastery,
            },
            {
                name: "Unknown",
                categoryId: "unknown-cat",
                mastery: "Novice" as Mastery,
            },
        ],
        languages: [{ name: "English", proficiency: "C1" as Proficiency }],
    }

    it("extracts and normalizes basic lists and domains correctly", () => {
        const { result } = renderHook(() => useCvPreview(baseCv))

        expect(result.current.projects).toEqual(baseCv.projects)
        expect(result.current.skills).toEqual(baseCv.skills)
        expect(result.current.languages).toEqual(baseCv.languages)
        expect(result.current.domains).toEqual(["Fintech"])
    })

    it("handles missing nested arrays gracefully", () => {
        const emptyCv = {
            id: "cv-2",
            name: "Jane",
            education: null,
            description: "Dev",
            projects: null,
            skills: null,
            languages: null,
        } as unknown as CvDetailsItem

        const { result } = renderHook(() => useCvPreview(emptyCv))

        expect(result.current.projects).toEqual([])
        expect(result.current.skills).toEqual([])
        expect(result.current.languages).toEqual([])
        expect(result.current.domains).toEqual([])
        expect(result.current.categories.size).toBe(0)
    })

    it("categorizes skills correctly with fallback for unknown categories", () => {
        const { result } = renderHook(() => useCvPreview(baseCv))

        expect(result.current.categories.has("categories.frontend")).toBe(true)
        expect(result.current.categories.has("categories.backend")).toBe(true)
        expect(result.current.categories.has("categories.other")).toBe(true)

        const frontendSkills = result.current.categories.get(
            "categories.frontend",
        )
        expect(frontendSkills).toHaveLength(1)
        expect(frontendSkills?.[0].name).toBe("React")

        const unknownSkills = result.current.categories.get("categories.other")
        expect(unknownSkills).toHaveLength(1)
        expect(unknownSkills?.[0].name).toBe("Unknown")
    })

    it("formats project periods correctly, including fallback for null end date", () => {
        const { result } = renderHook(() => useCvPreview(baseCv))
        const projects = baseCv.projects ?? []

        const periodWithEnd = result.current.getFormattedPeriod(projects[0])
        expect(periodWithEnd).toContain("–")

        const periodWithoutEnd = result.current.getFormattedPeriod(projects[1])
        expect(periodWithoutEnd).toContain("tillNow")
    })

    it("returns correct mastery and language proficiency labels", () => {
        const { result } = renderHook(() => useCvPreview(baseCv))

        const masteryLabel = result.current.getMasteryLabel("Expert" as Mastery)
        expect(masteryLabel).toBe("masteryLevels.expert")

        const proficiencyLabel = result.current.getLanguageProficiencyLabel(
            "C1" as Proficiency,
        )
        expect(proficiencyLabel).toBe("proficiencyLevels.C1")
    })
})
