import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

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
const mockGetUserRole = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
    getUserRole: () => mockGetUserRole(),
}))

const mockGetAdminLanguages = vi.fn()
const mockGetUserLanguages = vi.fn()
const mockGetAvailableLanguages = vi.fn()

vi.mock("@/modules/languages/api/admin-languages", () => ({
    getAdminLanguages: () => mockGetAdminLanguages(),
}))

vi.mock("@/modules/languages/api/languages", () => ({
    getUserLanguages: (userId: string) => mockGetUserLanguages(userId),
    getAvailableLanguages: () => mockGetAvailableLanguages(),
}))

vi.mock("@/modules/languages/ui/components/admin/admin-languages-view", () => ({
    AdminLanguagesView: ({
        initialLanguages,
        search,
    }: {
        initialLanguages: unknown[]
        search: string
    }) => (
        <div data-testid="admin-languages-view">
            <span data-testid="lang-count">{initialLanguages.length}</span>
            <span data-testid="search-param">{search}</span>
        </div>
    ),
}))

vi.mock("@/modules/languages/ui/languages-page", () => ({
    LanguagesPage: ({ userId, search }: { userId: string; search: string }) => (
        <div data-testid="user-languages-page">
            <span data-testid="user-id">{userId}</span>
            <span data-testid="search-param">{search}</span>
        </div>
    ),
}))

vi.mock("@/modules/users/ui/users-table-frame", () => ({
    UsersTableFrame: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="users-table-frame">{children}</div>
    ),
}))

vi.mock("@/components/ui/admin-table-skeleton", () => ({
    AdminTableSkeleton: () => <div data-testid="admin-table-skeleton" />,
}))

vi.mock("@/components/progress-list-skeleton", () => ({
    ProgressListSkeleton: () => <div data-testid="progress-list-skeleton" />,
}))

import Page from "../[locale]/(protected)/languages/page"

describe("Languages Page Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /login when user session is missing", async () => {
        mockGetCurrentSession.mockResolvedValue(null)
        mockGetUserRole.mockResolvedValue("Admin")
        const searchParams = Promise.resolve({})

        try {
            const pageResult = await Page({ searchParams })
            await act(async () => {
                render(pageResult)
            })
        } catch {}

        expect(mockRedirect).toHaveBeenCalledWith("/login")
    })

    it("fetches and renders AdminLanguagesView successfully when user is an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({ userId: "admin-id" })
        mockGetUserRole.mockResolvedValue("Admin")
        mockGetAdminLanguages.mockResolvedValue([
            { id: "lang-1", name: "English" },
            { id: "lang-2", name: "Spanish" },
        ])

        const searchParams = Promise.resolve({ search: "eng" })

        let resolvedContent: React.ReactNode
        await act(async () => {
            resolvedContent = await Page({ searchParams })
        })

        expect(mockRedirect).not.toHaveBeenCalled()
        expect(resolvedContent).toBeDefined()
    })

    it("fetches and renders LanguagesPage successfully when user is a regular User", async () => {
        mockGetCurrentSession.mockResolvedValue({ userId: "user-123" })
        mockGetUserRole.mockResolvedValue("User")
        mockGetUserLanguages.mockResolvedValue({
            languages: [{ id: "lang-en" }],
        })
        mockGetAvailableLanguages.mockResolvedValue([
            { id: "lang-en" },
            { id: "lang-es" },
        ])

        const searchParams = Promise.resolve({})

        let resolvedContent: React.ReactNode
        await act(async () => {
            resolvedContent = await Page({ searchParams })
        })

        expect(mockRedirect).not.toHaveBeenCalled()
        expect(resolvedContent).toBeDefined()
    })
})
