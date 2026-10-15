import { act, render, screen, waitFor } from "@testing-library/react"
import { Suspense } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import UserCvsPage from "../[locale]/(protected)/users/[userId]/cv/page"

const mockRedirect = vi.fn()
vi.mock("@/i18n/navigation", () => ({
    redirect: (params: unknown) => {
        mockRedirect(params)
        return new Error(`NEXT_REDIRECT`)
    },
}))

vi.mock("@/i18n/routing", () => ({
    routing: { defaultLocale: "en" },
}))

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

const mockGetUserCvs = vi.fn()
vi.mock("@/modules/cvs/api/cvs", () => ({
    getUserCvs: (userId: string, query: unknown) =>
        mockGetUserCvs(userId, query),
}))

vi.mock("@/modules/cvs/cv-sort", () => ({
    parseCvSort: () => ({ sortBy: "name", sortOrder: "asc" }),
}))

vi.mock("@/modules/cvs/ui/cvs-page-view", () => ({
    CvsPageView: () => <div data-testid="cvs-page-view" />,
}))

vi.mock("@/components/pagination", () => ({
    PaginationComponent: () => <div data-testid="pagination-component" />,
}))

vi.mock("@/modules/cvs/ui/cvs-list-skeleton", () => ({
    CvsListSkeleton: () => <div data-testid="cvs-list-skeleton" />,
}))

describe("UserCvsPage Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /auth/login when user session is missing", async () => {
        mockGetCurrentSession.mockResolvedValue(null)
        const params = Promise.resolve({ locale: "en", userId: "user-1" })
        const searchParams = Promise.resolve({})

        try {
            await act(async () => {
                render(
                    <Suspense fallback={null}>
                        <UserCvsPage
                            params={params}
                            searchParams={searchParams}
                        />
                    </Suspense>,
                )
            })
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith({
                href: "/auth/login",
                locale: "en",
            })
        })
    })

    it("redirects to user profile when user is not admin and requests another user's cvs", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-1",
            role: "User",
        })
        const params = Promise.resolve({ locale: "en", userId: "user-2" })
        const searchParams = Promise.resolve({})

        try {
            await act(async () => {
                render(
                    <Suspense fallback={null}>
                        <UserCvsPage
                            params={params}
                            searchParams={searchParams}
                        />
                    </Suspense>,
                )
            })
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith({
                href: "/users/user-2/profile",
                locale: "en",
            })
        })
    })

    it("fetches and renders CvsPageView successfully when authorized", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        })
        mockGetUserCvs.mockResolvedValue({
            items: [{ id: "cv-1", title: "Frontend Developer CV" }],
            total_pages: 1,
        })

        const params = Promise.resolve({ locale: "en", userId: "user-2" })
        const searchParams = Promise.resolve({ page: "1", limit: "10" })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <UserCvsPage params={params} searchParams={searchParams} />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("cvs-page-view")).toBeInTheDocument()
            expect(
                screen.getByTestId("pagination-component"),
            ).toBeInTheDocument()
        })

        expect(mockGetUserCvs).toHaveBeenCalledWith(
            "user-2",
            expect.any(Object),
        )
        expect(mockRedirect).not.toHaveBeenCalled()
    })
})
