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
    NavUserMenuItem: vi.fn(({ label, onClick, href, labelClassName }) => (
        <button
            type="button"
            data-testid={`menu-item-${label.toLowerCase()}`}
            onClick={onClick}
        >
            <span className={labelClassName}>{label}</span>{" "}
            {href ? `(${href})` : ""}
        </button>
    )),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: vi.fn(({ children }) => <div>{children}</div>),
    DropdownMenuTrigger: vi.fn(({ children, ...props }) => (
        <div {...props}>{children}</div>
    )),
    DropdownMenuContent: vi.fn(
        ({
            children,
            className,
            side,
            align,
        }: {
            children: React.ReactNode
            className?: string
            side?: string
            align?: string
        }) => (
            <div
                data-testid="dropdown-content"
                className={className}
                data-side={side}
                data-align={align}
            >
                {children}
            </div>
        ),
    ),
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

    it("does not close sidebar on logout when not mobile", async () => {
        render(<NavUserMenu user={sampleUser} />)

        const logoutItem = screen.getByTestId("menu-item-logout")
        await userEvent.click(logoutItem)

        expect(mockSetOpenMobile).not.toHaveBeenCalled()
        expect(logout).toHaveBeenCalledTimes(1)
    })

    it("renders correctly in tablet expanded state", () => {
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: false,
            isTablet: true,
            state: "expanded",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        render(<NavUserMenu user={sampleUser} />)

        expect(screen.getByTestId("dropdown-content")).toBeInTheDocument()
        expect(screen.getByTestId("menu-item-profile")).toBeInTheDocument()
        expect(screen.getByTestId("menu-item-settings")).toBeInTheDocument()
        expect(screen.getByTestId("menu-item-logout")).toBeInTheDocument()
    })

    it("renders correctly in tablet collapsed state", () => {
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: false,
            isTablet: true,
            state: "collapsed",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        render(<NavUserMenu user={sampleUser} />)

        const content = screen.getByTestId("dropdown-content")
        expect(content).toHaveClass("w-12")
        expect(content).toHaveAttribute("data-side", "top")
        expect(screen.getByText("profile")).toHaveClass("sr-only")
    })

    it("uses the compact menu when the desktop sidebar is collapsed", () => {
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: false,
            isTablet: false,
            state: "collapsed",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        render(<NavUserMenu user={sampleUser} />)

        const content = screen.getByTestId("dropdown-content")
        expect(content).toHaveClass("w-12")
        expect(content.className).not.toContain("min-w-56")
        expect(content).toHaveAttribute("data-side", "top")
        expect(content).toHaveAttribute("data-align", "center")
        expect(screen.getByText("profile")).toHaveClass("sr-only")
        expect(screen.getByText("settings")).toHaveClass("sr-only")
        expect(screen.getByText("logout")).toHaveClass("sr-only")
    })

    it("shows viewProfile text when not on tablet", () => {
        render(<NavUserMenu user={sampleUser} />)

        expect(screen.getByText("viewProfile")).toBeInTheDocument()
    })

    it("does not show viewProfile text when on tablet", () => {
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: false,
            isTablet: true,
            state: "expanded",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        render(<NavUserMenu user={sampleUser} />)

        expect(screen.queryByText("viewProfile")).not.toBeInTheDocument()
    })

    it("closes mobile sidebar when clicking settings on mobile", async () => {
        vi.mocked(useSidebar).mockReturnValue({
            isMobile: true,
            isTablet: false,
            state: "expanded",
            setOpenMobile: mockSetOpenMobile,
        } as unknown as ReturnType<typeof useSidebar>)

        render(<NavUserMenu user={sampleUser} />)

        const settingsItem = screen.getByTestId("menu-item-settings")
        await userEvent.click(settingsItem)

        expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
    })

    it("handles user with no name — shows email", () => {
        const userNoName: NavUserData = {
            id: "user-2",
            email: "noname@example.com",
            firstName: null,
            lastName: null,
            avatar: null,
        }

        render(<NavUserMenu user={userNoName} />)

        expect(screen.getByText("noname@example.com")).toBeInTheDocument()
    })
})
