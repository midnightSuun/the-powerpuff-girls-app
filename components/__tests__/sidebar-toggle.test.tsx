import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useSidebar } from "@/components/ui/sidebar"

import { SidebarToggle } from "../sidebar-toggle"

const mockedUseSidebar = vi.mocked(useSidebar)

const mockToggleSidebar = vi.fn()
const defaultSidebarContext = {
    toggleSidebar: mockToggleSidebar,
    state: "expanded" as const,
    isMobile: false,
    isTablet: false,
    openMobile: false,
    open: true,
    setOpen: vi.fn(),
    setOpenMobile: vi.fn(),
}

vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: vi.fn(() => defaultSidebarContext),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("SidebarToggle", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders correctly when sidebar is expanded", () => {
        mockedUseSidebar.mockReturnValue({
            ...defaultSidebarContext,
            state: "expanded",
        })

        render(<SidebarToggle />)

        const button = screen.getByRole("button", { name: "Hide sidebar" })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute("aria-expanded", "true")
    })

    it("renders correctly when sidebar is collapsed", () => {
        mockedUseSidebar.mockReturnValue({
            ...defaultSidebarContext,
            state: "collapsed",
        })

        render(<SidebarToggle />)

        const button = screen.getByRole("button", { name: "Show sidebar" })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute("aria-expanded", "false")
    })

    it("toggles sidebar when clicked", () => {
        mockedUseSidebar.mockReturnValue({
            ...defaultSidebarContext,
            state: "expanded",
        })

        render(<SidebarToggle />)

        const button = screen.getByRole("button", { name: "Hide sidebar" })
        fireEvent.click(button)

        expect(mockToggleSidebar).toHaveBeenCalledTimes(1)
    })

    it("handles mobile state correctly using openMobile", () => {
        mockedUseSidebar.mockReturnValue({
            ...defaultSidebarContext,
            state: "collapsed",
            isMobile: true,
            openMobile: true,
        })

        render(<SidebarToggle />)

        const button = screen.getByRole("button", { name: "Hide sidebar" })
        expect(button).toHaveAttribute("aria-expanded", "true")
    })

    it("applies tablet specific classes when isTablet is true", () => {
        mockedUseSidebar.mockReturnValue({
            ...defaultSidebarContext,
            state: "expanded",
            isTablet: true,
        })

        render(<SidebarToggle />)

        const button = screen.getByRole("button", { name: "Hide sidebar" })
        expect(button).toHaveClass("absolute top-10 right-0 z-40")
    })
})
