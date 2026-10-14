import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "../[locale]/(protected)/departments/page"

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

const mockGetAdminDepartments = vi.fn()
vi.mock("@/modules/departments", () => ({
    getAdminDepartments: (search: string) => mockGetAdminDepartments(search),
    AdminDepartmentsView: ({
        initialDepartments,
    }: {
        initialDepartments: unknown[]
    }) => (
        <div data-testid="admin-departments-view">
            <span data-testid="departments-count">
                {initialDepartments.length}
            </span>
        </div>
    ),
}))

describe("Departments Page Server Component", () => {
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

    it("fetches and renders AdminDepartmentsView successfully when user is an Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-1",
            email: "admin@test.com",
        })
        mockGetUserRole.mockResolvedValue("Admin")
        mockGetAdminDepartments.mockResolvedValue([
            { id: "dept-1", name: "Engineering" },
            { id: "dept-2", name: "HR" },
        ])

        const searchParams = Promise.resolve({ search: "eng" })

        await act(async () => {
            render(<Page searchParams={searchParams} />)
        })

        await waitFor(() => {
            expect(
                screen.getByTestId("admin-departments-view"),
            ).toBeInTheDocument()
        })

        expect(mockGetAdminDepartments).toHaveBeenCalledWith("eng")
        expect(screen.getByTestId("departments-count")).toHaveTextContent("2")
        expect(mockRedirect).not.toHaveBeenCalled()
    })
})
