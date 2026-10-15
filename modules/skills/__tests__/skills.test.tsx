import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"
import { getAvailableSkills } from "@/modules/skills/api/skills"

import { Skills } from "../ui/skills"

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn(async () => {
        const translations: Record<string, string> = {
            "categories.1": "Programming Languages",
            "categories.2": "Frontend",
            "categories.9": "Backend",
            "categories.other": "Other",
        }
        const tFn = (key: string) => translations[key] || key
        tFn.has = (key: string) => key in translations
        tFn.rich = (
            key: string,
            _values?: Record<
                string,
                string | number | ReactNode | ((chunks: ReactNode) => ReactNode)
            >,
        ) => translations[key] || key
        return tFn
    }),
}))

vi.mock("../ui/components/user/skills-view", () => ({
    SkillsView: ({
        categories,
        canManageSkills,
    }: {
        cvId: string
        categories: { id: string; title: string; skills: { name: string }[] }[]
        canManageSkills: boolean
        typedSkills: unknown[]
        availableSkills: unknown[]
        compact?: boolean
    }) => (
        <div data-testid="skills-view">
            {categories.map((category) => (
                <div key={category.id}>
                    <h2>{category.title}</h2>
                    {category.skills.map((skill) => (
                        <span key={skill.name}>{skill.name}</span>
                    ))}
                </div>
            ))}
            {canManageSkills && (
                <button type="button" aria-label="add">
                    add
                </button>
            )}
        </div>
    ),
}))

vi.mock("@/modules/skills/api/skills", () => ({
    getAvailableSkills: vi.fn(async () => [
        { id: "s-1", name: "Python", category: "Languages", categoryId: "1" },
    ]),
}))

describe("Skills (Server Component)", () => {
    const mockUserSkills = {
        cvId: "cv-1",
        skills: [
            { name: "TypeScript", mastery: "Advanced" as Mastery },
            { name: "React", mastery: "Intermediate" as Mastery },
            { name: "Node.js", mastery: "Competent" as Mastery },
        ],
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("groups skills into resolved categories and renders successfully", async () => {
        const jsx = await Skills({
            userSkills: mockUserSkills,
            role: "Employee",
        })

        const { container } = render(jsx)

        expect(screen.getByText("Programming Languages")).toBeInTheDocument()
        expect(screen.getByText("Frontend")).toBeInTheDocument()
        expect(screen.getByText("Backend")).toBeInTheDocument()

        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("Node.js")).toBeInTheDocument()

        expect(getAvailableSkills).toHaveBeenCalledTimes(1)
        container.remove()
    })

    it("determines canManageSkills based on role='Employee'", async () => {
        const jsx = await Skills({
            userSkills: mockUserSkills,
            role: "Employee",
        })

        const { container } = render(jsx)
        const addButtons = screen.getAllByRole("button", { name: /add/i })
        expect(addButtons.length).toBeGreaterThan(0)
        container.remove()
    })

    it("determines canManageSkills as false for other roles unless overridden", async () => {
        const jsx = await Skills({
            userSkills: mockUserSkills,
            role: "Admin",
            canManageSkills: false,
        })

        const { container } = render(jsx)
        expect(
            screen.queryByRole("button", { name: /add/i }),
        ).not.toBeInTheDocument()
        expect(getAvailableSkills).not.toHaveBeenCalled()
        container.remove()
    })

    it("filters categories and skills based on search query", async () => {
        const jsx = await Skills({
            userSkills: mockUserSkills,
            role: "Employee",
            search: "react",
        })

        const { container } = render(jsx)

        expect(screen.getByText("Frontend")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()

        expect(
            screen.queryByText("Programming Languages"),
        ).not.toBeInTheDocument()
        expect(screen.queryByText("Backend")).not.toBeInTheDocument()
        container.remove()
    })

    it("includes whole category when search matches category title", async () => {
        // Строка 108: matchesSearch(category.title, search) → вся категория включается
        const jsx = await Skills({
            userSkills: mockUserSkills,
            role: "Employee",
            search: "frontend",
        })

        const { container } = render(jsx)

        // Категория "Frontend" совпадает по названию → все скиллы внутри видны
        expect(screen.getByText("Frontend")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        container.remove()
    })

    it("excludes categories with no matches in search", async () => {
        // Строка 108: категория не совпадает, скиллы не совпадают → не рендерится
        const jsx = await Skills({
            userSkills: mockUserSkills,
            role: "Employee",
            search: "python",
        })

        const { container } = render(jsx)

        expect(screen.queryByText("Frontend")).not.toBeInTheDocument()
        expect(screen.queryByText("Backend")).not.toBeInTheDocument()
        expect(
            screen.queryByText("Programming Languages"),
        ).not.toBeInTheDocument()
        container.remove()
    })

    it("resolves categoryId from skill.categoryId when present and not 'other'", async () => {
        const skillsWithCategoryId = {
            cvId: "cv-2",
            skills: [
                {
                    name: "CustomSkill",
                    mastery: "Advanced" as Mastery,
                    categoryId: "5",
                    category: "custom",
                },
            ],
        }

        const jsx = await Skills({
            userSkills: skillsWithCategoryId,
            role: "Employee",
        })

        const { container } = render(jsx)
        expect(screen.getByText("CustomSkill")).toBeInTheDocument()
        container.remove()
    })

    it("resolves categoryId from skill.category when categoryId is 'other'", async () => {
        const skillsWithOtherCategoryId = {
            cvId: "cv-3",
            skills: [
                {
                    name: "AnotherSkill",
                    mastery: "Novice" as Mastery,
                    categoryId: "other",
                    category: "design",
                },
            ],
        }

        const jsx = await Skills({
            userSkills: skillsWithOtherCategoryId,
            role: "Employee",
        })

        const { container } = render(jsx)
        expect(screen.getByText("AnotherSkill")).toBeInTheDocument()
        container.remove()
    })

    it("falls back to 'other' when skill name does not match any known set", async () => {
        const unknownSkills = {
            cvId: "cv-4",
            skills: [
                {
                    name: "Figma",
                    mastery: "Competent" as Mastery,
                },
            ],
        }

        const jsx = await Skills({
            userSkills: unknownSkills,
            role: "Employee",
        })

        const { container } = render(jsx)
        expect(screen.getByText("Other")).toBeInTheDocument()
        expect(screen.getByText("Figma")).toBeInTheDocument()
        container.remove()
    })
})
