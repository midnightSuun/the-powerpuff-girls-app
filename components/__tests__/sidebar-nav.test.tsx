import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { usePathname } from "@/i18n/navigation"

import { SidebarNav } from "../sidebar-nav"

const mockedUsePathname = vi.mocked(usePathname)

vi.mock("@/i18n/navigation", () => ({
    usePathname: vi.fn(),
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}))

vi.mock("@/components/ui/sidebar", () => ({
    SidebarGroup: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="sidebar-group" className={className}>
            {children}
        </div>
    ),
    SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    SidebarMenu: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <ul className={className}>{children}</ul>,
    SidebarMenuItem: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <li className={className}>{children}</li>,
    SidebarMenuButton: ({
        children,
        isActive,
        tooltip,
        "aria-current": ariaCurrent,
    }: {
        children: React.ReactNode
        isActive?: boolean
        tooltip?: string
        "aria-current"?:
            | "page"
            | "step"
            | "location"
            | "date"
            | "time"
            | boolean
            | "true"
            | "false"
    }) => (
        <div
            data-testid="sidebar-menu-button"
            data-active={String(isActive)}
            aria-current={ariaCurrent}
            title={tooltip}
        >
            {children}
        </div>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
}))

describe("SidebarNav", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders standard navigation items for regular users", () => {
        mockedUsePathname.mockReturnValue("/users")

        render(<SidebarNav isAdmin={false} viewerId="user-1" />)

        expect(screen.getByText("employees")).toBeInTheDocument()
        expect(screen.getByText("skills")).toBeInTheDocument()
        expect(screen.getByText("languages")).toBeInTheDocument()
        expect(screen.getByText("cvs")).toBeInTheDocument()

        expect(screen.queryByText("departments")).not.toBeInTheDocument()
        expect(screen.queryByText("projects")).not.toBeInTheDocument()
    })

    it("renders admin navigation items and separator when isAdmin is true", () => {
        mockedUsePathname.mockReturnValue("/projects")

        render(<SidebarNav isAdmin={true} viewerId="user-1" />)

        expect(screen.getByText("departments")).toBeInTheDocument()
        expect(screen.getByText("positions")).toBeInTheDocument()
        expect(screen.getByText("projects")).toBeInTheDocument()
    })

    it("correctly sets active state for /users when viewing another user profile", () => {
        mockedUsePathname.mockReturnValue("/users/user-2")

        render(<SidebarNav isAdmin={false} viewerId="user-1" />)

        const buttons = screen.getAllByTestId("sidebar-menu-button")
        expect(buttons[0]).toHaveAttribute("data-active", "true")
        expect(buttons[0]).toHaveAttribute("aria-current", "page")
    })

    it("does not set active state for /users when viewing own profile", () => {
        mockedUsePathname.mockReturnValue("/users/user-1")

        render(<SidebarNav isAdmin={false} viewerId="user-1" />)

        const buttons = screen.getAllByTestId("sidebar-menu-button")
        expect(buttons[0]).toHaveAttribute("data-active", "false")
        expect(buttons[0]).not.toHaveAttribute("aria-current")
    })
})
