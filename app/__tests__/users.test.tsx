import { act, render, screen, waitFor } from "@testing-library/react"
import { Suspense } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import UsersRoute from "../[locale]/(protected)/users/page"

const mockGetCurrentSession = vi.fn()
vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

vi.mock("@/lib/pagination-search-params", () => ({
    parsePaginationSearchParams: () => ({
        limit: 10,
        page: 1,
        search: "",
        sortBy: "name",
        sortOrder: "asc",
    }),
}))

vi.mock("@/modules/users", () => ({
    CreateUserDialog: () => <div data-testid="create-user-dialog" />,
    UsersPage: () => <div data-testid="users-page" />,
    UsersTableFrame: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="users-table-frame">{children}</div>
    ),
}))

describe("UsersRoute Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders CreateUserDialog when user is an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        })
        const searchParams = Promise.resolve({})

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <UsersRoute searchParams={searchParams} />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("create-user-dialog")).toBeInTheDocument()
        })
        expect(screen.getByTestId("users-page")).toBeInTheDocument()
    })

    it("does not render CreateUserDialog when user is not an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-1",
            role: "User",
        })
        const searchParams = Promise.resolve({})

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <UsersRoute searchParams={searchParams} />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(
                screen.queryByTestId("create-user-dialog"),
            ).not.toBeInTheDocument()
        })
        expect(screen.getByTestId("users-page")).toBeInTheDocument()
    })
})
