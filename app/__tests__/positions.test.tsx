import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "../[locale]/(protected)/positions/page"

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

const mockGetAdminPositions = vi.fn()
vi.mock("@/modules/positions", () => ({
    getAdminPositions: (search: string) => mockGetAdminPositions(search),
    AdminPositionsView: ({
        initialPositions,
    }: {
        initialPositions: unknown[]
    }) => (
        <div data-testid="admin-positions-view">
            <span data-testid="positions-count">{initialPositions.length}</span>
        </div>
    ),
}))

describe("Positions Page Server Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /login when user session is missing", async () => {
        mockGetCurrentSession.mockResolvedValue(null)
        const searchParams = Promise.resolve({})

        try {
            render(<Page searchParams={searchParams} />)
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith("/login")
        })
    })

    it("redirects to / when user role is not Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-1",
            email: "test@test.com",
        })
        mockGetUserRole.mockResolvedValue("User")
        const searchParams = Promise.resolve({})

        try {
            render(<Page searchParams={searchParams} />)
        } catch {}

        await waitFor(() => {
            expect(mockRedirect).toHaveBeenCalledWith("/")
        })
    })

    it("fetches and renders AdminPositionsView successfully when user is an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            email: "admin@test.com",
        })
        mockGetUserRole.mockResolvedValue("Admin")
        mockGetAdminPositions.mockResolvedValue([
            { id: "pos-1", name: "Frontend Developer" },
            { id: "pos-2", name: "Backend Developer" },
        ])

        const searchParams = Promise.resolve({ search: "dev" })

        await act(async () => {
            render(<Page searchParams={searchParams} />)
        })

        await waitFor(() => {
            expect(
                screen.getByTestId("admin-positions-view"),
            ).toBeInTheDocument()
        })

        expect(mockGetAdminPositions).toHaveBeenCalledWith("dev")
        expect(screen.getByTestId("positions-count")).toHaveTextContent("2")
        expect(mockRedirect).not.toHaveBeenCalled()
    })
})
