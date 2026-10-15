import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/hooks/use-mobile", () => ({
    useIsMobile: vi.fn(),
    useIsTablet: vi.fn(),
}))

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => ({
    usePathname: vi.fn(() => "/"),
}))

import { useIsMobile, useIsTablet } from "@/hooks/use-mobile"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "../sidebar"

const HookConsumer = () => {
    useSidebar()
    return null
}

describe("Sidebar Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useIsMobile).mockReturnValue(false)
        vi.mocked(useIsTablet).mockReturnValue(false)
    })

    afterEach(() => {
        document.cookie =
            "sidebar_state=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    })

    const TestSidebarLayout = () => (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>My Header</SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton isActive>
                                        Active Item
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        Normal Item
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>My Footer</SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <SidebarTrigger />
                <div>Main Content</div>
            </SidebarInset>
        </SidebarProvider>
    )

    it("should throw an error if useSidebar is used outside of SidebarProvider", () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        expect(() => render(<HookConsumer />)).toThrow(
            "useSidebar must be used within a SidebarProvider.",
        )

        consoleError.mockRestore()
    })

    it("should render all main structural elements correctly", () => {
        render(<TestSidebarLayout />)

        expect(screen.getByText("My Header")).toBeInTheDocument()
        expect(screen.getByText("Navigation")).toBeInTheDocument()
        expect(screen.getByText("Active Item")).toBeInTheDocument()
        expect(screen.getByText("My Footer")).toBeInTheDocument()
        expect(screen.getByText("Main Content")).toBeInTheDocument()
    })

    it("should open and close the sidebar when SidebarTrigger is clicked", async () => {
        const user = userEvent.setup()
        render(<TestSidebarLayout />)

        const sidebar = screen
            .getByText("My Header")
            .closest('[data-slot="sidebar"]')

        expect(sidebar).toHaveAttribute("data-state", "expanded")

        const trigger = screen.getByRole("button", { name: /toggleSidebar/i })
        await user.click(trigger)

        expect(sidebar).toHaveAttribute("data-state", "collapsed")

        await user.click(trigger)
        expect(sidebar).toHaveAttribute("data-state", "expanded")
    })

    it("should toggle the sidebar using keyboard shortcut (Ctrl/Cmd + B)", async () => {
        render(<TestSidebarLayout />)

        const sidebar = screen
            .getByText("My Header")
            .closest('[data-slot="sidebar"]')
        expect(sidebar).toHaveAttribute("data-state", "expanded")

        fireEvent.keyDown(window, { key: "b", ctrlKey: true })
        expect(sidebar).toHaveAttribute("data-state", "collapsed")

        fireEvent.keyDown(window, { key: "b", metaKey: true })
        expect(sidebar).toHaveAttribute("data-state", "expanded")
    })

    it("should render as a mobile Sheet if isMobile is true", async () => {
        const user = userEvent.setup()
        vi.mocked(useIsMobile).mockReturnValue(true)

        render(<TestSidebarLayout />)

        const trigger = screen.getByRole("button", { name: /toggleSidebar/i })
        await user.click(trigger)

        const header = await screen.findByText("My Header")
        const sidebar = header.closest('[data-sidebar="sidebar"]')

        expect(sidebar).toHaveAttribute("data-mobile", "true")
    })

    it("should correctly apply data-active attribute to the active SidebarMenuButton", () => {
        render(<TestSidebarLayout />)

        const activeItem = screen.getByText("Active Item").closest("button")
        const normalItem = screen.getByText("Normal Item").closest("button")

        expect(activeItem).toHaveAttribute("data-active")
        expect(normalItem).not.toHaveAttribute("data-active")
    })

    it("should save state to cookie upon toggling", async () => {
        const user = userEvent.setup()
        render(<TestSidebarLayout />)

        const trigger = screen.getByRole("button", { name: /toggleSidebar/i })
        await user.click(trigger)

        expect(document.cookie).toContain("sidebar_state=false")
    })
})
