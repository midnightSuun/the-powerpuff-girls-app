import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"

import { getUser } from "../api/get-user"
import { NavUser } from "../ui/user-nav"

vi.mock("@/modules/skills/helpers/get-auth-user-id", () => ({
    getAuthUserId: vi.fn(),
}))

vi.mock("../api/get-user", () => ({
    getUser: vi.fn(),
}))

vi.mock("../ui/nav-user-menu", () => ({
    NavUserMenu: vi.fn(
        ({ user }: { user: Awaited<ReturnType<typeof getUser>> }) => (
            <div data-testid="nav-user-menu" data-user={JSON.stringify(user)}>
                {user?.email}
            </div>
        ),
    ),
}))

describe("NavUser Server Component", () => {
    const mockUserId = "user-123"
    const mockUserData: Awaited<ReturnType<typeof getUser>> = {
        id: "user-123",
        created_at: "2026-01-01T00:00:00.000Z",
        email: "test@example.com",
        is_verified: true,
        role: "Employee",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: "avatar.jpg",
        },
        department: null,
        position: null,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns null when no authenticated user id is found", async () => {
        vi.mocked(getAuthUserId).mockResolvedValueOnce(null)

        const resolvedComponent = await NavUser()
        const { container } = render(resolvedComponent)

        expect(container).toBeEmptyDOMElement()
        expect(getUser).not.toHaveBeenCalled()
    })

    it("fetches user and renders NavUserMenu with correct mapped props when authenticated", async () => {
        vi.mocked(getAuthUserId).mockResolvedValueOnce(mockUserId)
        vi.mocked(getUser).mockResolvedValueOnce(mockUserData)

        const resolvedComponent = await NavUser()
        render(resolvedComponent)

        expect(getAuthUserId).toHaveBeenCalledTimes(1)
        expect(getUser).toHaveBeenCalledWith(mockUserId)

        const menuComponent = screen.getByTestId("nav-user-menu")
        expect(menuComponent).toBeInTheDocument()

        const passedUser = JSON.parse(
            menuComponent.getAttribute("data-user") || "{}",
        )
        expect(passedUser).toEqual({
            id: "user-123",
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
            avatar: "avatar.jpg",
        })
    })
})
