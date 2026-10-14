import { render, screen } from "@testing-library/react"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { getUsers } from "../api/get-users"
import { UsersList } from "../ui/users-list"

vi.mock("@/i18n/navigation", () => ({
    Link: vi.fn(
        ({ href, children }: { href: string; children: React.ReactNode }) => (
            <a href={href}>{children}</a>
        ),
    ),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
    })),
    usePathname: vi.fn(() => ""),
}))

vi.mock("next-intl/server", () => ({
    getLocale: vi.fn(),
    getTranslations: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("../api/get-users", () => ({
    getUsers: vi.fn(),
}))

vi.mock("../ui/users-table-client", () => ({
    UsersTableClient: vi.fn(
        ({
            isAdmin,
            emptyMessage,
        }: {
            isAdmin: boolean
            emptyMessage: string
        }) => (
            <div
                data-testid="users-table-client"
                data-is-admin={String(isAdmin)}
            >
                {emptyMessage}
            </div>
        ),
    ),
}))

vi.mock("@/components/pagination", () => ({
    PaginationComponent: vi.fn(
        ({ totalPages, path }: { totalPages: number; path: string }) => (
            <div
                data-testid="pagination"
                data-total-pages={totalPages}
                data-path={path}
            />
        ),
    ),
}))

describe("UsersList Server Component", () => {
    const defaultProps = {
        limit: 10,
        page: 1,
        search: "",
        sortBy: "first_name" as const,
        sortOrder: "asc" as const,
    }

    const mockUsersData = {
        users: [
            {
                id: "user-1",
                email: "test@example.com",
                profile: { first_name: "John", last_name: "Doe", avatar: null },
                department: { id: "dep-1", name: "Engineering" },
                position: { id: "pos-1", name: "Developer" },
                role: "ADMIN" as const,
            },
        ],
        totalPages: 5,
    }

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.mocked(getLocale).mockResolvedValue("en")
        const translator = (key: string) => key
        vi.mocked(getTranslations).mockResolvedValue(
            translator as unknown as Awaited<
                ReturnType<typeof getTranslations>
            >,
        )
    })

    it("redirects to /login when session is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        vi.mocked(redirect).mockImplementationOnce((url: string) => {
            throw new Error(`REDIRECTED TO: ${url}`)
        })

        await expect(UsersList(defaultProps)).rejects.toThrow(
            "REDIRECTED TO: /login",
        )

        expect(redirect).toHaveBeenCalledWith("/login")
        expect(getUsers).not.toHaveBeenCalled()
    })

    it("fetches users and renders UsersTableClient and PaginationComponent when session exists", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        vi.mocked(getUsers).mockResolvedValueOnce(
            mockUsersData as unknown as Awaited<ReturnType<typeof getUsers>>,
        )

        const resolvedComponent = await UsersList(defaultProps)
        render(resolvedComponent)

        expect(getLocale).toHaveBeenCalledTimes(1)
        expect(getTranslations).toHaveBeenCalledWith("Users")
        expect(getUsers).toHaveBeenCalledWith(
            10,
            1,
            "",
            "first_name",
            "asc",
            "en",
        )

        const tableClient = screen.getByTestId("users-table-client")
        expect(tableClient).toBeInTheDocument()
        expect(tableClient).toHaveAttribute("data-is-admin", "true")
        expect(tableClient).toHaveTextContent("noResults")

        const pagination = screen.getByTestId("pagination")
        expect(pagination).toBeInTheDocument()
        expect(pagination).toHaveAttribute("data-total-pages", "5")
        expect(pagination).toHaveAttribute("data-path", "users")
    })

    it("passes isAdmin as false when user role is not Admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "user-2",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        vi.mocked(getUsers).mockResolvedValueOnce(
            mockUsersData as unknown as Awaited<ReturnType<typeof getUsers>>,
        )

        const resolvedComponent = await UsersList(defaultProps)
        render(resolvedComponent)

        const tableClient = screen.getByTestId("users-table-client")
        expect(tableClient).toHaveAttribute("data-is-admin", "false")
    })
})
