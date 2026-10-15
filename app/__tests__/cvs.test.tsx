import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "../[locale]/(protected)/cv/page"

const mockRedirect = vi.fn()
vi.mock("next/navigation", () => ({
    redirect: (url: string) => {
        mockRedirect(url)
        return new Error(`NEXT_REDIRECT:${url}`)
    },
}))

vi.mock("next-intl/server", () => ({
    getLocale: vi.fn(async () => "en"),
}))

vi.mock("@/i18n/routing", () => ({
    routing: {
        defaultLocale: "en",
    },
}))

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

const mockGetAdminCvs = vi.fn()
const mockGetUserCvs = vi.fn()
vi.mock("@/modules/cvs/api/cvs", () => ({
    getAdminCvs: (...args: unknown[]) => mockGetAdminCvs(...args),
    getUserCvs: (...args: unknown[]) => mockGetUserCvs(...args),
}))

vi.mock("@/modules/cvs/cv-sort", () => ({
    parseCvSort: () => ({ sortBy: "updated_at", sortOrder: "desc" }),
}))

vi.mock("@/modules/cvs", () => ({
    CvsPageView: ({
        initialCvs,
        isAdmin,
    }: {
        initialCvs: unknown[]
        isAdmin: boolean
    }) => (
        <div data-testid="cvs-page-view">
            <span data-testid="is-admin">{String(isAdmin)}</span>
            <span data-testid="cvs-count">{initialCvs.length}</span>
        </div>
    ),
    CvsListSkeleton: ({ showSearch }: { showSearch: boolean }) => (
        <div data-testid="cvs-list-skeleton">
            <span data-testid="show-search">{String(showSearch)}</span>
        </div>
    ),
}))

vi.mock("@/components/pagination", () => ({
    PaginationComponent: ({
        totalPages,
        page,
    }: {
        totalPages: number
        page: number
    }) => (
        <div data-testid="pagination">
            <span data-testid="total-pages">{totalPages}</span>
            <span data-testid="current-page">{page}</span>
        </div>
    ),
}))

describe("CvsPage Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /login when user session is missing", async () => {
        mockGetCurrentSession.mockResolvedValue(null)
        const searchParams = Promise.resolve({})

        render(<Page searchParams={searchParams} />)

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith("/login")
        })
    })

    it("fetches and renders admin cvs correctly when user is an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        })
        mockGetAdminCvs.mockResolvedValue({
            items: [{ id: "cv-1", title: "Admin CV", education: null }],
            total_pages: 3,
        })

        const searchParams = Promise.resolve({
            page: "2",
            limit: "5",
            search: "react",
        })
        const ResolvedPage = Page({ searchParams })

        await act(async () => {
            render(ResolvedPage)
        })

        await waitFor(() => {
            expect(screen.getByTestId("cvs-page-view")).toBeInTheDocument()
        })

        expect(mockGetAdminCvs).toHaveBeenCalledWith({
            search: "react",
            limit: 5,
            page: 2,
            sort_by: "updated_at",
            sort_order: "desc",
        })

        expect(screen.getByTestId("is-admin")).toHaveTextContent("true")
        expect(screen.getByTestId("cvs-count")).toHaveTextContent("1")
        expect(screen.getByTestId("total-pages")).toHaveTextContent("3")
        expect(screen.getByTestId("current-page")).toHaveTextContent("2")
    })

    it("fetches and renders user cvs correctly when user is a regular User", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-123",
            role: "User",
        })
        mockGetUserCvs.mockResolvedValue({
            items: [{ id: "cv-2", title: "My CV", education: "BSUIR" }],
            total_pages: 1,
        })

        const searchParams = Promise.resolve({})
        const ResolvedPage = Page({ searchParams })

        await act(async () => {
            render(ResolvedPage)
        })

        await waitFor(() => {
            expect(screen.getByTestId("cvs-page-view")).toBeInTheDocument()
        })

        expect(mockGetUserCvs).toHaveBeenCalledWith(
            "user-123",
            expect.objectContaining({
                page: 1,
                limit: 10,
                search: "",
            }),
        )

        expect(screen.getByTestId("is-admin")).toHaveTextContent("false")
        expect(screen.getByTestId("cvs-count")).toHaveTextContent("1")
    })
})
