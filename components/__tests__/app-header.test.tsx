import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppHeader } from "../app-header"

const mockUseSidebar = vi.fn()
vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: () => mockUseSidebar(),
}))

vi.mock("@/components/cv-builder-logo", () => ({
    CvBuilderLogo: ({ className }: { className?: string }) => (
        <div data-testid="cv-builder-logo" data-classname={className} />
    ),
}))

vi.mock("@/components/sidebar-toggle", () => ({
    SidebarToggle: () => <button data-testid="sidebar-toggle">Toggle</button>,
}))

describe("AppHeader", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders nothing when isMobile is false", () => {
        mockUseSidebar.mockReturnValue({
            isMobile: false,
            openMobile: false,
        })

        const { container } = render(<AppHeader />)
        expect(container).toBeEmptyDOMElement()
    })

    it("renders nothing when isMobile is true and openMobile is true", () => {
        mockUseSidebar.mockReturnValue({
            isMobile: true,
            openMobile: true,
        })

        const { container } = render(<AppHeader />)
        expect(container).toBeEmptyDOMElement()
    })

    it("renders header with logo, title and toggle when isMobile is true and openMobile is false", () => {
        mockUseSidebar.mockReturnValue({
            isMobile: true,
            openMobile: false,
        })

        render(<AppHeader />)

        expect(screen.getByText("CV Builder")).toBeInTheDocument()
        expect(screen.getByTestId("cv-builder-logo")).toBeInTheDocument()
        expect(screen.getByTestId("sidebar-toggle")).toBeInTheDocument()
    })

    it("passes className prop to CvBuilderLogo when header is rendered", () => {
        mockUseSidebar.mockReturnValue({
            isMobile: true,
            openMobile: false,
        })

        render(<AppHeader />)

        const logo = screen.getByTestId("cv-builder-logo")
        expect(logo).toHaveAttribute("data-classname", "size-6 shrink-0")
    })

    it("renders header element with correct class", () => {
        mockUseSidebar.mockReturnValue({
            isMobile: true,
            openMobile: false,
        })

        render(<AppHeader />)

        const header = screen.getByRole("banner")
        expect(header).toHaveClass("flex", "h-14", "shrink-0")
    })
})
