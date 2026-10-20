import { act, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import SkillsPage from "../[locale]/(protected)/skills/page"

const mockRedirect = vi.fn()
vi.mock("next/navigation", () => ({
    redirect: (url: string) => {
        mockRedirect(url)
        return new Error(`NEXT_REDIRECT:${url}`)
    },
}))

vi.mock("@/lib/list-search-params", () => ({
    readListSearch: (search: unknown) =>
        typeof search === "string" ? search : "",
}))

const mockGetAuthUserId = vi.fn()
const mockGetUserRole = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getUserRole: () => mockGetUserRole(),
}))
vi.mock("@/modules/skills/helpers/get-auth-user-id", () => ({
    getAuthUserId: () => mockGetAuthUserId(),
}))

const mockGetAdminSkills = vi.fn()
const mockGetSkillCategories = vi.fn()
vi.mock("@/modules/skills/api/admin-skills", () => ({
    getAdminSkills: () => mockGetAdminSkills(),
    getSkillCategories: () => mockGetSkillCategories(),
}))

const mockGetUserSkills = vi.fn()
vi.mock("@/modules/skills/api/skills", () => ({
    getUserSkills: (userId: string) => mockGetUserSkills(userId),
}))

vi.mock("@/modules/skills/ui/components/admin/admin-skills-view", () => ({
    AdminSkillsView: ({
        initialSkills,
        search,
    }: {
        initialSkills: unknown[]
        search: string
    }) => (
        <div data-testid="admin-skills-view">
            <span data-testid="skills-count">{initialSkills.length}</span>
            <span data-testid="search-param">{search}</span>
        </div>
    ),
}))

vi.mock("@/modules/skills/ui/skills", () => ({
    Skills: ({
        userSkills,
        search,
    }: {
        userSkills: unknown[]
        search: string
    }) => (
        <div data-testid="user-skills-view">
            <span data-testid="user-skills-count">{userSkills.length}</span>
            <span data-testid="search-param">{search}</span>
        </div>
    ),
}))

vi.mock("@/modules/users/ui/users-table-frame", () => ({
    UsersTableFrame: ({
        children,
        placeholder,
    }: {
        children: React.ReactNode
        placeholder?: React.ReactNode
    }) => (
        <React.Suspense fallback={placeholder ?? null}>
            {children}
        </React.Suspense>
    ),
}))

vi.mock("@/components/ui/admin-table-skeleton", () => ({
    AdminTableSkeleton: () => <div data-testid="admin-table-skeleton" />,
}))

vi.mock("@/components/progress-list-skeleton", () => ({
    ProgressListSkeleton: () => <div data-testid="progress-list-skeleton" />,
}))

describe("SkillsPage Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /login when user id is missing", async () => {
        mockGetAuthUserId.mockResolvedValue(null)
        mockGetUserRole.mockResolvedValue("User")
        const searchParams = Promise.resolve({})

        const resolvedPage = (await SkillsPage({
            searchParams,
        })) as React.ReactElement

        try {
            render(resolvedPage)
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith("/login")
        })
    })

    it("fetches and renders AdminSkillsView successfully when user is an Admin", async () => {
        mockGetAuthUserId.mockResolvedValue("admin-1")
        mockGetUserRole.mockResolvedValue("Admin")
        mockGetAdminSkills.mockResolvedValue([
            { id: "skill-1", name: "JavaScript" },
            { id: "skill-2", name: "TypeScript" },
        ])
        mockGetSkillCategories.mockResolvedValue([
            { id: "cat-1", name: "Frontend" },
        ])

        const searchParams = Promise.resolve({ search: "script" })

        const resolvedPage = (await SkillsPage({
            searchParams,
        })) as React.ReactElement

        await act(async () => {
            render(resolvedPage)
        })

        await waitFor(() => {
            expect(screen.getByTestId("admin-skills-view")).toBeInTheDocument()
        })

        expect(mockGetAdminSkills).toHaveBeenCalled()
        expect(mockGetSkillCategories).toHaveBeenCalled()
        expect(screen.getByTestId("skills-count")).toHaveTextContent("2")
        expect(screen.getByTestId("search-param")).toHaveTextContent("script")
        expect(mockRedirect).not.toHaveBeenCalled()
    })

    it("fetches and renders Skills successfully when user is a regular User", async () => {
        mockGetAuthUserId.mockResolvedValue("user-1")
        mockGetUserRole.mockResolvedValue("User")
        mockGetUserSkills.mockResolvedValue([
            { id: "user-skill-1", name: "React" },
        ])

        const searchParams = Promise.resolve({ search: "react" })

        const resolvedPage = (await SkillsPage({
            searchParams,
        })) as React.ReactElement

        await act(async () => {
            render(resolvedPage)
        })

        await waitFor(() => {
            expect(screen.getByTestId("user-skills-view")).toBeInTheDocument()
        })

        expect(mockGetUserSkills).toHaveBeenCalledWith("user-1")
        expect(screen.getByTestId("user-skills-count")).toHaveTextContent("1")
        expect(screen.getByTestId("search-param")).toHaveTextContent("react")
        expect(mockRedirect).not.toHaveBeenCalled()
    })
})
