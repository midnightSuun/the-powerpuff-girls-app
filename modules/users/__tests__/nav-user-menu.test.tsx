import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useSidebar } from "@/components/ui/sidebar"
import { logout } from "@/modules/auth/api/logout"
import { AUTH_NOTIFICATION_STORAGE_KEY } from "@/modules/auth/consts"

import { NavUserData, NavUserMenu } from "../ui/nav-user-menu"

vi.mock("@/components/ui/sidebar", () => ({
    SidebarMenu: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
    SidebarMenuItem: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
    SidebarMenuButton: vi.fn(({ children, ...props }) => (
        <button type="button" {...props}>
            {children}
        </button>
    )),
    useSidebar: vi.fn(),
}))

vi.mock("@/modules/auth/api/logout", () => ({
    logout: vi.fn(),
}))

vi.mock("../ui/user-avatar", () => ({
    UserAvatar: vi.fn(() => <div data-testid="user-avatar" />),
}))

vi.mock("../ui/nav-user-menu-item", () => ({
    NavUserMenuItem: vi.fn(({ label, onClick, href }) => (
        <button
            type="button"
            data-testid={`menu-item-${label.toLowerCase()}`}
            onClick={onClick}
        >
            {label} {href ? `(${href})` : ""}
        </button>
    )),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: vi.fn(({ children }) => <div>{children}</div>),
    DropdownMenuTrigger: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
    DropdownMenuContent: vi.fn(({ children }) => (
        <div data-testid="dropdown-content">{children}</div>
    )),
    DropdownMenuGroup: vi.fn(({ children }) => <div>{children}</div>),
    DropdownMenuItem: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
    DropdownMenuSeparator: vi.fn(() => <hr />),
}))

describe("NavUserMenu Component", () => {
    const mockSetOpenMobile = vi.fn()

    const sampleUser: NavUserData = {
        id: "user-1",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        avatar: "avatar.jpg",
    }

    const mockSessionStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
    }

    const originalSessionStorage = window.sessionStorage

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: false,
            isTablet: false,
            state: "expanded",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        Object.defineProperty(window, "sessionStorage", {
            value: mockSessionStorage,
            writable: true,
            configurable: true,
        })
    })

    afterEach(() => {
        vi.resetAllMocks()
        Object.defineProperty(window, "sessionStorage", {
            value: originalSessionStorage,
            writable: true,
            configurable: true,
        })
    })

    it("renders user full name and profile menu items correctly", () => {
        render(<NavUserMenu user={sampleUser} />)

        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(screen.getByTestId("menu-item-profile")).toBeInTheDocument()
        expect(screen.getByTestId("menu-item-settings")).toBeInTheDocument()
        expect(screen.getByTestId("menu-item-logout")).toBeInTheDocument()
    })

    it("closes mobile sidebar when clicking profile or settings on mobile", async () => {
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: true,
            isTablet: false,
            state: "expanded",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        render(<NavUserMenu user={sampleUser} />)

        const profileItem = screen.getByTestId("menu-item-profile")
        await userEvent.click(profileItem)

        expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
    })

    it("handles logout process correctly (sets sessionStorage and calls logout)", async () => {
        render(<NavUserMenu user={sampleUser} />)

        const logoutItem = screen.getByTestId("menu-item-logout")
        await userEvent.click(logoutItem)

        expect(sessionStorage.setItem).toHaveBeenCalledWith(
            AUTH_NOTIFICATION_STORAGE_KEY,
            "logout",
        )
        expect(logout).toHaveBeenCalledTimes(1)
    })
})
