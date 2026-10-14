import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { getProfileOptions } from "../api/get-profile-options"
import { getUser } from "../api/get-user"
import { UserPage } from "../ui/user-page"

vi.mock("next/navigation", () => ({
    redirect: vi.fn((url: string) => {
        throw new Error(`REDIRECTED TO: ${url}`)
    }),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("../api/get-user", () => ({
    getUser: vi.fn(),
}))

vi.mock("../api/get-profile-options", () => ({
    getProfileOptions: vi.fn(),
}))

vi.mock("../ui/user-profile-form", () => ({
    UserProfileForm: vi.fn(
        ({
            user,
            departments,
            positions,
        }: {
            user: Awaited<ReturnType<typeof getUser>>
            departments: Array<{ id: string; name: string }>
            positions: Array<{ id: string; name: string }>
        }) => (
            <div data-testid="user-profile-form" data-user-id={user?.id}>
                <span>Departments: {departments.length}</span>
                <span>Positions: {positions.length}</span>
            </div>
        ),
    ),
}))

describe("UserPage Server Component", () => {
    const sampleUserId = "user-123"
    const sampleUser: Awaited<ReturnType<typeof getUser>> = {
        id: "user-123",
        created_at: "2026-01-01T00:00:00.000Z",
        email: "test@example.com",
        is_verified: true,
        role: "Employee",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: null,
        },
        department: null,
        position: null,
    }

    const sampleOptions: Awaited<ReturnType<typeof getProfileOptions>> = {
        departments: [{ id: "dep-1", name: "Engineering" }],
        positions: [{ id: "pos-1", name: "Developer" }],
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects to /auth/login when session is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        await expect(UserPage({ userId: sampleUserId })).rejects.toThrow(
            "REDIRECTED TO: /auth/login",
        )

        expect(getUser).not.toHaveBeenCalled()
        expect(getProfileOptions).not.toHaveBeenCalled()
    })

    it("fetches profile options and renders UserProfileForm when user is owner", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "user-123",
            role: "Employee",
        } satisfies Awaited<ReturnType<typeof getCurrentSession>>)
        vi.mocked(getUser).mockResolvedValueOnce(sampleUser)
        vi.mocked(getProfileOptions).mockResolvedValueOnce(sampleOptions)

        const resolvedComponent = await UserPage({ userId: sampleUserId })
        render(resolvedComponent)

        expect(getUser).toHaveBeenCalledWith(sampleUserId)
        expect(getProfileOptions).toHaveBeenCalledTimes(1)

        const form = screen.getByTestId("user-profile-form")
        expect(form).toBeInTheDocument()
        expect(screen.getByText("Departments: 1")).toBeInTheDocument()
        expect(screen.getByText("Positions: 1")).toBeInTheDocument()
    })

    it("fetches profile options and renders UserProfileForm when current user is Admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-999",
            role: "Admin",
        } satisfies Awaited<ReturnType<typeof getCurrentSession>>)
        vi.mocked(getUser).mockResolvedValueOnce(sampleUser)
        vi.mocked(getProfileOptions).mockResolvedValueOnce(sampleOptions)

        const resolvedComponent = await UserPage({ userId: sampleUserId })
        render(resolvedComponent)

        expect(getProfileOptions).toHaveBeenCalledTimes(1)
        expect(screen.getByText("Departments: 1")).toBeInTheDocument()
    })

    it("does not fetch profile options and passes empty arrays when user lacks edit permissions", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "other-user-456",
            role: "Employee",
        } satisfies Awaited<ReturnType<typeof getCurrentSession>>)
        vi.mocked(getUser).mockResolvedValueOnce(sampleUser)

        const resolvedComponent = await UserPage({ userId: sampleUserId })
        render(resolvedComponent)

        expect(getProfileOptions).not.toHaveBeenCalled()
        expect(screen.getByText("Departments: 0")).toBeInTheDocument()
        expect(screen.getByText("Positions: 0")).toBeInTheDocument()
    })
})
