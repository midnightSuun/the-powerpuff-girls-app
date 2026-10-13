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
        // Используем getAllByRole, чтобы взять первую попавшуюся кнопку добавления во избежание конфликтов
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
})
