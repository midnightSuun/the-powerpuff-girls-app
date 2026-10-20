import { act, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import AdminProjectsPage from "../[locale]/(protected)/projects/page"

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

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

const mockGetAvailableProjects = vi.fn()
vi.mock("@/modules/cvs/api/projects", () => ({
    getAvailableProjects: () => mockGetAvailableProjects(),
}))

vi.mock("@/modules/projects", () => ({
    AdminProjectsView: ({
        projects,
        search,
    }: {
        projects: unknown[]
        search: string
    }) => (
        <div data-testid="admin-projects-view">
            <span data-testid="projects-count">{projects.length}</span>
            <span data-testid="search-param">{search}</span>
        </div>
    ),
}))

vi.mock("@/modules/users", () => ({
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

vi.mock("@/components/project-list-skeleton", () => ({
    ProjectListSkeleton: () => (
        <div data-testid="project-list-skeleton">Loading...</div>
    ),
}))

describe("AdminProjectsPage Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /login when user session is missing", async () => {
        mockGetCurrentSession.mockResolvedValue(null)
        const searchParams = Promise.resolve({})

        try {
            render(<AdminProjectsPage searchParams={searchParams} />)
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith("/login")
        })
    })

    it("redirects to / when user role is not Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-1",
            role: "User",
            email: "test@test.com",
        })
        const searchParams = Promise.resolve({})

        try {
            render(<AdminProjectsPage searchParams={searchParams} />)
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith("/")
        })
    })

    it("fetches and renders AdminProjectsView successfully when user is an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
            email: "admin@test.com",
        })
        mockGetAvailableProjects.mockResolvedValue([
            { id: "proj-1", name: "FormFlow" },
            { id: "proj-2", name: "HCare-CRM" },
        ])

        const searchParams = Promise.resolve({ search: "form" })

        await act(async () => {
            render(<AdminProjectsPage searchParams={searchParams} />)
        })

        await waitFor(() => {
            expect(
                screen.getByTestId("admin-projects-view"),
            ).toBeInTheDocument()
        })

        expect(mockGetAvailableProjects).toHaveBeenCalled()
        expect(screen.getByTestId("projects-count")).toHaveTextContent("2")
        expect(screen.getByTestId("search-param")).toHaveTextContent("form")
        expect(mockRedirect).not.toHaveBeenCalled()
    })
})
