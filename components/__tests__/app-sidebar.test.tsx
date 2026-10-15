import { act, render, screen, waitFor } from "@testing-library/react"
import { Suspense } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppSidebar } from "../app-sidebar"

const mockGetCurrentSession = vi.fn()

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: () => mockGetCurrentSession(),
}))

vi.mock("@/components/ui/sidebar", () => ({
    SidebarProvider: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    Sidebar: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="sidebar" className={className}>
            {children}
        </div>
    ),
    SidebarHeader: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="sidebar-header" className={className}>
            {children}
        </div>
    ),
    SidebarContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="sidebar-content">{children}</div>
    ),
    SidebarFooter: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="sidebar-footer" className={className}>
            {children}
        </div>
    ),
}))

vi.mock("@/components/cv-builder-logo", () => ({
    CvBuilderLogo: () => <div data-testid="cv-builder-logo" />,
}))

vi.mock("@/components/ui/skeleton", () => ({
    Skeleton: ({ className }: { className?: string }) => (
        <div data-slot="skeleton" data-classname={className} />
    ),
}))

vi.mock("@/components/sidebar-toggle", () => ({
    SidebarToggle: () => <button data-testid="sidebar-toggle">Toggle</button>,
}))

vi.mock("@/components/sidebar-nav", () => ({
    SidebarNav: vi.fn(
        ({
            isAdmin,
            viewerId,
        }: {
            isAdmin: boolean
            viewerId: string | null
        }) => (
            <div
                data-testid="sidebar-nav"
                data-is-admin={String(isAdmin)}
                data-viewer-id={viewerId ?? "null"}
            >
                SidebarNav
            </div>
        ),
    ),
}))

vi.mock("@/modules/users", () => ({
    NavUser: vi.fn(() => <div data-testid="nav-user">NavUser</div>),
}))

describe("AppSidebar", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders sidebar structure with logo, title and toggle correctly", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-123",
            role: "Employee",
        })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <AppSidebar />
                </Suspense>,
            )
        })

        await waitFor(() => {
            expect(screen.getByTestId("sidebar-nav")).toBeInTheDocument()
        })

        expect(screen.getByTestId("sidebar")).toBeInTheDocument()
        expect(screen.getByTestId("sidebar-header")).toBeInTheDocument()
        expect(screen.getByTestId("cv-builder-logo")).toBeInTheDocument()
        expect(screen.getByText("CV Builder")).toBeInTheDocument()
        expect(screen.getByTestId("sidebar-toggle")).toBeInTheDocument()
        expect(screen.getByTestId("nav-user")).toBeInTheDocument()
    })

    it("passes isAdmin=true and viewerId to SidebarNav when user is Admin", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "admin-999",
            role: "Admin",
        })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <AppSidebar />
                </Suspense>,
            )
        })

        await waitFor(() => {
            const nav = screen.getByTestId("sidebar-nav")
            expect(nav).toHaveAttribute("data-is-admin", "true")
            expect(nav).toHaveAttribute("data-viewer-id", "admin-999")
        })
    })

    it("passes isAdmin=false and viewerId=null when session is missing", async () => {
        mockGetCurrentSession.mockResolvedValue(null)

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <AppSidebar />
                </Suspense>,
            )
        })

        await waitFor(() => {
            const nav = screen.getByTestId("sidebar-nav")
            expect(nav).toHaveAttribute("data-is-admin", "false")
            expect(nav).toHaveAttribute("data-viewer-id", "null")
        })
    })

    it("passes isAdmin=false when user has a non-admin role", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-456",
            role: "User",
        })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <AppSidebar />
                </Suspense>,
            )
        })

        await waitFor(() => {
            const nav = screen.getByTestId("sidebar-nav")
            expect(nav).toHaveAttribute("data-is-admin", "false")
            expect(nav).toHaveAttribute("data-viewer-id", "user-456")
        })
    })

    it("handles session without role gracefully and sets isAdmin=false", async () => {
        mockGetCurrentSession.mockResolvedValue({
            userId: "user-no-role",
        })

        await act(async () => {
            render(
                <Suspense fallback={null}>
                    <AppSidebar />
                </Suspense>,
            )
        })

        await waitFor(() => {
            const nav = screen.getByTestId("sidebar-nav")
            expect(nav).toHaveAttribute("data-is-admin", "false")
            expect(nav).toHaveAttribute("data-viewer-id", "user-no-role")
        })
    })
})
