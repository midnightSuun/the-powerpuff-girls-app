import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { usePathname } from "@/i18n/navigation"

import { SidebarNavItem } from "../sidebar-nav-item"

const mockedUsePathname = vi.mocked(usePathname)

vi.mock("@/i18n/navigation", () => ({
    usePathname: vi.fn(),
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}))

vi.mock("@/components/ui/sidebar", () => ({
    SidebarMenuItem: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="sidebar-menu-item" className={className}>
            {children}
        </div>
    ),
    SidebarMenuButton: ({
        children,
        isActive,
        tooltip,
        "aria-current": ariaCurrent,
        className,
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
        className?: string
    }) => (
        <div
            data-testid="sidebar-menu-button"
            data-active={String(isActive)}
            aria-current={ariaCurrent}
            title={tooltip}
            className={className}
        >
            {children}
        </div>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
}))

describe("SidebarNavItem", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders sidebar nav item correctly and sets active state when pathname matches", () => {
        mockedUsePathname.mockReturnValue("/dashboard")

        render(
            <SidebarNavItem href="/dashboard" label="Dashboard">
                <span data-testid="icon">📊</span>
            </SidebarNavItem>,
        )

        const link = screen.getByText("Dashboard")
        expect(link).toBeInTheDocument()
        expect(screen.getByTestId("icon")).toBeInTheDocument()

        const menuButton = screen.getByTestId("sidebar-menu-button")
        expect(menuButton).toHaveAttribute("data-active", "true")
        expect(menuButton).toHaveAttribute("aria-current", "page")
        expect(menuButton).toHaveAttribute("title", "Dashboard")
    })

    it("sets active state when pathname is a subroute of href", () => {
        mockedUsePathname.mockReturnValue("/dashboard/settings/profile")

        render(
            <SidebarNavItem href="/dashboard" label="Dashboard">
                <span>📊</span>
            </SidebarNavItem>,
        )

        const menuButton = screen.getByTestId("sidebar-menu-button")
        expect(menuButton).toHaveAttribute("data-active", "true")
        expect(menuButton).toHaveAttribute("aria-current", "page")
    })

    it("renders as inactive when pathname does not match href", () => {
        mockedUsePathname.mockReturnValue("/profile")

        render(
            <SidebarNavItem href="/dashboard" label="Dashboard">
                <span>📊</span>
            </SidebarNavItem>,
        )

        const menuButton = screen.getByTestId("sidebar-menu-button")
        expect(menuButton).toHaveAttribute("data-active", "false")
        expect(menuButton).not.toHaveAttribute("aria-current")
    })
})
