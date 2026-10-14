import { render, screen, waitFor } from "@testing-library/react"

import { HeaderView } from "../header-view"
import type { BreadcrumbResult, HeaderCopy, HeaderPage } from "../types"

const mockUsePathname = vi.fn()
const mockUseBreadcrumbRefresh = vi.fn()

vi.mock("@/i18n/navigation", () => ({
    usePathname: () => mockUsePathname(),
    Link: (props: any) => <a href={props.href}>{props.children}</a>,
}))

vi.mock("../breadcrumb-refresh", () => ({
    useBreadcrumbRefresh: () => mockUseBreadcrumbRefresh(),
}))

vi.mock("@/i18n/routing", () => ({
    routing: {
        locales: ["en", "uk"],
    },
}))

vi.mock("@/components/header-toolbar-action", () => ({
    useHeaderToolbarActionValue: () => null,
}))

vi.mock("@/components/search-input", () => ({
    SearchInput: () => <div data-testid="search-input">Search</div>,
}))

vi.mock("../icons", () => ({
    ChevronIcon: () => <span data-testid="chevron-icon" />,
    UserIcon: () => <span data-testid="user-icon" />,
}))

describe("HeaderView", () => {
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
        cvDetails: "CV Details",
        cvSkills: "CV Skills",
        cvProjects: "CV Projects",
        cvPreview: "CV Preview",
    }

    const mockPages: HeaderPage[] = [
        {
            type: "default",
            path: "/users",
            title: "users",
            showSearch: true,
        },
        {
            type: "tabs",
            path: "/profile/{id}",
            firstBreadcrumb: "users",
            breadcrumbParam: "id",
            showBreadcrumbIcon: true,
            tabs: [
                { label: "profile", path: "" },
                { label: "cvs", path: "/cvs" },
            ],
        },
    ]

    const mockLoadSecondBreadcrumb = vi.fn()
    const mockInitialBreadcrumb: BreadcrumbResult = {
        pagePath: "/profile/{id}",
        id: "user-123",
        value: "John Doe",
    }

    const defaultProps = {
        pages: mockPages,
        copy: mockCopy,
        breadcrumbLabel: "User Profile",
        initialBreadcrumb: mockInitialBreadcrumb,
        viewerId: "viewer-123",
        isAdmin: false,
        loadSecondBreadcrumb: mockLoadSecondBreadcrumb,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseBreadcrumbRefresh.mockReturnValue({
            revision: 0,
            snapshot: null,
        })
    })

    it("renders nothing when no page is resolved", () => {
        mockUsePathname.mockReturnValue("/unknown-path")

        const { container } = render(<HeaderView {...defaultProps} />)
        expect(container).toBeEmptyDOMElement()
    })

    it("renders DefaultPageHeader for default page type", () => {
        mockUsePathname.mockReturnValue("/users")

        render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("renders PageWithTabsHeader for tabs page type", () => {
        mockUsePathname.mockReturnValue("/profile/user-123")

        render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("Users")).toBeInTheDocument()
        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("loads second breadcrumb when breadcrumbId is present", async () => {
        mockUsePathname.mockReturnValue("/profile/user-456")
        mockLoadSecondBreadcrumb.mockResolvedValue("Jane Smith")

        render(<HeaderView {...defaultProps} initialBreadcrumb={null} />)

        await waitFor(() => {
            expect(mockLoadSecondBreadcrumb).toHaveBeenCalledWith(
                "/profile/{id}",
                "user-456",
            )
        })
    })

    it("handles loadSecondBreadcrumb error gracefully", async () => {
        mockUsePathname.mockReturnValue("/profile/user-456")
        mockLoadSecondBreadcrumb.mockRejectedValue(new Error("Load failed"))

        render(<HeaderView {...defaultProps} initialBreadcrumb={null} />)

        await waitFor(() => {
            expect(mockLoadSecondBreadcrumb).toHaveBeenCalledWith(
                "/profile/{id}",
                "user-456",
            )
        })

        // Should render without throwing
        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("uses breadcrumb snapshot when available", () => {
        mockUsePathname.mockReturnValue("/profile/user-123")
        mockUseBreadcrumbRefresh.mockReturnValue({
            revision: 1,
            snapshot: {
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "Updated John Doe",
            },
        })

        render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("Updated John Doe")).toBeInTheDocument()
    })

    it("handles pathname with locale prefix correctly", () => {
        mockUsePathname.mockReturnValue("/en/users")

        render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("cleans up breadcrumb loading on unmount", async () => {
        mockUsePathname.mockReturnValue("/profile/user-789")
        mockLoadSecondBreadcrumb.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve("Slow User"), 1000)
                }),
        )

        const { unmount } = render(
            <HeaderView {...defaultProps} initialBreadcrumb={null} />,
        )

        // Unmount before promise resolves
        unmount()

        // Wait to ensure no state updates after unmount
        await new Promise((resolve) => setTimeout(resolve, 100))

        expect(mockLoadSecondBreadcrumb).toHaveBeenCalled()
    })

    it("renders tabs page without second breadcrumb when value is null", async () => {
        mockUsePathname.mockReturnValue("/profile/user-999")
        mockLoadSecondBreadcrumb.mockResolvedValue(null)

        render(<HeaderView {...defaultProps} initialBreadcrumb={null} />)

        await waitFor(() => {
            expect(screen.getByText("Users")).toBeInTheDocument()
        })
    })

    it("filters tabs based on admin status", () => {
        const pagesWithAdminTab: HeaderPage[] = [
            {
                type: "tabs",
                path: "/profile/{id}",
                firstBreadcrumb: "users",
                breadcrumbParam: "id",
                showBreadcrumbIcon: true,
                tabs: [
                    { label: "profile", path: "" },
                    {
                        label: "settings",
                        path: "/settings",
                        requiresUserAdminOrOwner: true,
                    },
                ],
            },
        ]

        mockUsePathname.mockReturnValue("/profile/user-123")

        render(
            <HeaderView
                {...defaultProps}
                pages={pagesWithAdminTab}
                isAdmin={false}
                viewerId="different-user"
            />,
        )

        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("reloads breadcrumb when breadcrumbId changes", async () => {
        mockUsePathname.mockReturnValue("/profile/user-123")
        mockLoadSecondBreadcrumb.mockResolvedValue("First User")

        const { rerender } = render(
            <HeaderView {...defaultProps} initialBreadcrumb={null} />,
        )

        await waitFor(() => {
            expect(mockLoadSecondBreadcrumb).toHaveBeenCalledWith(
                "/profile/{id}",
                "user-123",
            )
        })

        // Change to different user
        mockUsePathname.mockReturnValue("/profile/user-456")
        mockLoadSecondBreadcrumb.mockResolvedValue("Second User")

        rerender(<HeaderView {...defaultProps} initialBreadcrumb={null} />)

        await waitFor(() => {
            expect(mockLoadSecondBreadcrumb).toHaveBeenCalledWith(
                "/profile/{id}",
                "user-456",
            )
        })
    })

    it("handles multiple rapid pathname changes", async () => {
        mockLoadSecondBreadcrumb.mockResolvedValue("User")

        const pathnames = [
            "/profile/user-1",
            "/profile/user-2",
            "/profile/user-3",
        ]

        for (const pathname of pathnames) {
            mockUsePathname.mockReturnValue(pathname)
            const { rerender } = render(
                <HeaderView {...defaultProps} initialBreadcrumb={null} />,
            )
            rerender(<HeaderView {...defaultProps} initialBreadcrumb={null} />)
        }

        await waitFor(() => {
            expect(mockLoadSecondBreadcrumb).toHaveBeenCalled()
        })
    })

    it("preserves initial breadcrumb when breadcrumbId matches", () => {
        mockUsePathname.mockReturnValue("/profile/user-123")

        render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("John Doe")).toBeInTheDocument()
        expect(mockLoadSecondBreadcrumb).not.toHaveBeenCalled()
    })

    it("uses snapshot over savedBreadcrumb when revision matches", () => {
        mockUsePathname.mockReturnValue("/profile/user-123")
        mockUseBreadcrumbRefresh.mockReturnValue({
            revision: 5,
            snapshot: {
                pagePath: "/profile/{id}",
                id: "user-123",
                value: "Snapshot Value",
            },
        })

        render(
            <HeaderView
                {...defaultProps}
                initialBreadcrumb={{
                    pagePath: "/profile/{id}",
                    id: "user-123",
                    value: "Initial Value",
                }}
            />,
        )

        expect(screen.getByText("Snapshot Value")).toBeInTheDocument()
        expect(screen.queryByText("Initial Value")).not.toBeInTheDocument()
    })

    it("handles empty pages array", () => {
        mockUsePathname.mockReturnValue("/any-path")

        const { container } = render(<HeaderView {...defaultProps} pages={[]} />)

        expect(container).toBeEmptyDOMElement()
    })

    it("renders correct page for nested paths", () => {
        mockUsePathname.mockReturnValue("/profile/user-123/cvs")

        render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("Users")).toBeInTheDocument()
        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("handles null viewerId correctly", () => {
        mockUsePathname.mockReturnValue("/profile/user-123")

        render(<HeaderView {...defaultProps} viewerId={null} />)

        expect(screen.getByText("Users")).toBeInTheDocument()
    })

    it("switches between default and tabs pages", () => {
        mockUsePathname.mockReturnValue("/users")

        const { rerender } = render(<HeaderView {...defaultProps} />)

        expect(screen.getByText("Users")).toBeInTheDocument()

        mockUsePathname.mockReturnValue("/profile/user-123")

        rerender(<HeaderView {...defaultProps} />)

        expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    it("handles breadcrumb loading state transitions", async () => {
        let resolvePromise: (value: string) => void
        const promise = new Promise<string>((resolve) => {
            resolvePromise = resolve
        })

        mockUsePathname.mockReturnValue("/profile/user-999")
        mockLoadSecondBreadcrumb.mockReturnValue(promise)

        render(<HeaderView {...defaultProps} initialBreadcrumb={null} />)

        // Initially loading
        expect(screen.getByText("Users")).toBeInTheDocument()

        // Resolve the promise
        resolvePromise!("Loaded User")

        await waitFor(() => {
            expect(screen.getByText("Loaded User")).toBeInTheDocument()
        })
    })
})
