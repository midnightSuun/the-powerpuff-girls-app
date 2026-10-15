import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"

import { PageWithTabsHeader } from "../page-with-tabs-header"
import type { HeaderCopy, HeaderTab, HeaderTabsPage, PathMatch } from "../types"

vi.mock("@/i18n/navigation", () => ({
    Link: (props: {
        href: string
        className?: string
        "aria-current"?: "page" | "false" | "true"
        children: ReactNode
    }) => (
        <a
            href={props.href}
            className={props.className}
            aria-current={props["aria-current"]}
        >
            {props.children}
        </a>
    ),
}))

vi.mock("../icons", () => ({
    ChevronIcon: () => <span data-testid="chevron-icon" />,
    UserIcon: () => <span data-testid="user-icon" />,
}))

describe("PageWithTabsHeader", () => {
    const mockCopy: HeaderCopy = {
        users: "Users",
        skills: "Skills",
        languages: "Languages",
        settings: "Settings",
        departments: "Departments",
        positions: "Positions",
        projects: "Projects",
        profile: "Profile",
        cvs: "CVs",
        cvDetails: "cv details",
        cvSkills: "cv skills",
        cvProjects: "cv projects",
        cvPreview: "cv preview",
    }

    const basePage: HeaderTabsPage = {
        type: "tabs",
        path: "/profile/{userId}",
        firstBreadcrumb: "users",
        breadcrumbParam: "userId",
        showBreadcrumbIcon: true,
        tabs: [
            { label: "profile", path: "" },
            { label: "cvs", path: "/cvs" },
        ],
    }

    const baseMatch: PathMatch = {
        params: { userId: "user-1" },
        remainder: "",
    }

    const visibleTabs: HeaderTab[] = basePage.tabs

    it("renders navigation with breadcrumb label as aria-label", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(
            screen.getByRole("navigation", { name: "Breadcrumb" }),
        ).toBeInTheDocument()
    })

    it("renders first breadcrumb link", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("renders second breadcrumb with user name", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("renders user icon when showBreadcrumbIcon is true", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByTestId("user-icon")).toBeInTheDocument()
    })

    it("does not render user icon when showBreadcrumbIcon is false", () => {
        const pageNoIcon: HeaderTabsPage = {
            ...basePage,
            showBreadcrumbIcon: false,
        }

        render(
            <PageWithTabsHeader
                page={pageNoIcon}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.queryByTestId("user-icon")).not.toBeInTheDocument()
    })

    it("renders tab links for all visible tabs", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const allProfileTexts = screen.getAllByText("Profile")
        const allCvsTexts = screen.getAllByText("CVs")

        expect(allProfileTexts.length).toBeGreaterThan(0)
        expect(allCvsTexts.length).toBeGreaterThan(0)
    })

    it("marks active tab with aria-current=page", () => {
        const matchWithTab: PathMatch = {
            params: { userId: "user-1" },
            remainder: "/cvs",
        }

        render(
            <PageWithTabsHeader
                page={basePage}
                match={matchWithTab}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const allCvsTexts = screen.getAllByText("CVs")
        const cvsLink = allCvsTexts
            .find((el) => el.closest("a[aria-current='page']"))
            ?.closest("a")
        expect(cvsLink).toHaveAttribute("aria-current", "page")
    })

    it("shows active tab label in breadcrumb", () => {
        const matchWithTab: PathMatch = {
            params: { userId: "user-1" },
            remainder: "/cvs",
        }

        render(
            <PageWithTabsHeader
                page={basePage}
                match={matchWithTab}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const currentPageSpan = screen.getByText("CVs", {
            selector: "[aria-current='page']:not(a)",
        })
        expect(currentPageSpan).toBeInTheDocument()
    })

    it("renders chevron icons between breadcrumb items", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        // Two chevrons: one between first and second breadcrumb
        expect(
            screen.getAllByTestId("chevron-icon").length,
        ).toBeGreaterThanOrEqual(1)
    })

    it("renders two chevrons when active tab is shown in breadcrumb", () => {
        const matchWithTab: PathMatch = {
            params: { userId: "user-1" },
            remainder: "/cvs",
        }

        render(
            <PageWithTabsHeader
                page={basePage}
                match={matchWithTab}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getAllByTestId("chevron-icon")).toHaveLength(2)
    })

    it("capitalizes second breadcrumb by default", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="john doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const link = screen.getByText("john doe").closest("a")
        expect(link).toHaveClass("capitalize")
    })

    it("does not capitalize when preserveBreadcrumbCase is true", () => {
        const pagePreserveCase: HeaderTabsPage = {
            ...basePage,
            preserveBreadcrumbCase: true,
        }

        render(
            <PageWithTabsHeader
                page={pagePreserveCase}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const link = screen.getByText("John Doe").closest("a")
        expect(link).not.toHaveClass("capitalize")
    })

    it("renders correct href for first breadcrumb", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const firstBreadcrumbLink = screen.getByText("Users").closest("a")
        expect(firstBreadcrumbLink).toHaveAttribute("href", "/profile")
    })

    it("renders correct href for second breadcrumb", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const secondBreadcrumbLink = screen.getByText("John Doe").closest("a")
        expect(secondBreadcrumbLink).toHaveAttribute("href", "/profile/user-1")
    })

    it("renders correct href for tab links", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const allLinks = screen.getAllByRole("link")
        const profileLink = allLinks.find((link) =>
            link.textContent?.includes("Profile"),
        )
        const cvsLink = allLinks.find((link) =>
            link.textContent?.includes("CVs"),
        )

        expect(profileLink).toHaveAttribute("href", "/profile/user-1/")
        expect(cvsLink).toHaveAttribute("href", "/profile/user-1/cvs")
    })

    it("applies correct styling to active tab", () => {
        const matchWithTab: PathMatch = {
            params: { userId: "user-1" },
            remainder: "/cvs",
        }

        render(
            <PageWithTabsHeader
                page={basePage}
                match={matchWithTab}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const links = screen.getAllByText("CVs")
        const cvsLink = links.find((el) => el.closest("a"))?.closest("a")
        expect(cvsLink).toHaveClass(
            "font-semibold",
            "text-button-primary-default",
        )
    })

    it("applies correct styling to inactive tab", () => {
        const matchWithTab: PathMatch = {
            params: { userId: "user-1" },
            remainder: "/cvs",
        }

        render(
            <PageWithTabsHeader
                page={basePage}
                match={matchWithTab}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const profileLink = screen.getByText("Profile").closest("a")
        expect(profileLink).toHaveClass("font-medium")
        expect(profileLink).not.toHaveClass("font-semibold")
    })

    it("renders navigation as semantic <nav> element", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByRole("navigation")).toBeInTheDocument()
    })

    it("renders breadcrumb list with proper ol structure", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const nav = screen.getByRole("navigation")
        const list = nav.querySelector("ol")
        expect(list).toBeInTheDocument()
    })

    it("handles null second breadcrumb gracefully", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb={null}
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByRole("navigation")).toBeInTheDocument()
        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("renders with empty tabs array", () => {
        const pageNoTabs: HeaderTabsPage = {
            ...basePage,
            tabs: [],
        }

        render(
            <PageWithTabsHeader
                page={pageNoTabs}
                match={baseMatch}
                visibleTabs={[]}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByRole("navigation")).toBeInTheDocument()
        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("handles empty string breadcrumb", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb=""
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        expect(screen.getByRole("navigation")).toBeInTheDocument()
    })

    it("renders header with correct background classes", () => {
        const { container } = render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const header = container.querySelector("header")
        expect(header).toHaveClass(
            "w-full",
            "shrink-0",
            "bg-[#f5f5f7]",
            "dark:bg-[#2e2e2e]",
        )
    })

    it("renders tab navigation with overflow handling", () => {
        const { container } = render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const tabContainer = container.querySelector(".overflow-x-auto")
        expect(tabContainer).toBeInTheDocument()
    })

    it("renders tabs with correct uppercase styling", () => {
        render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const allLinks = screen.getAllByRole("link")
        const tabLinks = allLinks.filter((link) =>
            link.classList.contains("uppercase"),
        )
        expect(tabLinks.length).toBeGreaterThan(0)
    })

    it("renders active tab indicator line", () => {
        const matchWithTab: PathMatch = {
            params: { userId: "user-1" },
            remainder: "/cvs",
        }

        const { container } = render(
            <PageWithTabsHeader
                page={basePage}
                match={matchWithTab}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const activeIndicator = container.querySelector(
            ".bg-button-primary-default",
        )
        expect(activeIndicator).toBeInTheDocument()
    })

    it("handles very long second breadcrumb with truncation", () => {
        const longBreadcrumb = "A".repeat(100)

        const { container } = render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb={longBreadcrumb}
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const truncateSpan = container.querySelector(".truncate")
        expect(truncateSpan).toBeInTheDocument()
        expect(truncateSpan).toHaveTextContent(longBreadcrumb)
    })

    it("renders breadcrumb items with proper list structure", () => {
        const { container } = render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const listItems = container.querySelectorAll("ol > li")
        expect(listItems.length).toBeGreaterThan(0)
    })

    it("marks chevron icons with aria-hidden", () => {
        const { container } = render(
            <PageWithTabsHeader
                page={basePage}
                match={baseMatch}
                visibleTabs={visibleTabs}
                secondBreadcrumb="John Doe"
                copy={mockCopy}
                breadcrumbLabel="Breadcrumb"
            />,
        )

        const chevronListItems = container.querySelectorAll("li[aria-hidden]")
        expect(chevronListItems.length).toBeGreaterThan(0)
    })
})
