import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PaginationComponent } from "../pagination"

const mockTranslations: Record<string, string> = {
    label: "Pagination",
    previous: "Previous",
    previousLabel: "Go to previous page",
    next: "Next",
    nextLabel: "Go to next page",
    morePages: "More pages",
}

const mockGetTranslations = vi.fn(
    async () => (key: string) => mockTranslations[key] ?? key,
)

vi.mock("next-intl/server", () => ({
    getTranslations: () => mockGetTranslations(),
}))

vi.mock("@/lib/list-search-params", () => ({
    buildListSearchParams: (params: Record<string, unknown>) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.set(key, String(value))
            }
        })
        return searchParams.toString()
    },
}))

vi.mock("@/components/ui/pagination", () => ({
    Pagination: ({
        children,
        "aria-label": ariaLabel,
        className,
    }: {
        children: React.ReactNode
        "aria-label"?: string
        className?: string
    }) => (
        <nav
            aria-label={ariaLabel}
            className={className}
            data-testid="pagination-root"
        >
            {children}
        </nav>
    ),
    PaginationContent: ({ children }: { children: React.ReactNode }) => (
        <ul>{children}</ul>
    ),
    PaginationItem: ({ children }: { children: React.ReactNode }) => (
        <li>{children}</li>
    ),
    PaginationLink: ({
        children,
        href,
        isActive,
    }: {
        children: React.ReactNode
        href: string
        isActive?: boolean
    }) => (
        <a
            href={href}
            data-active={String(isActive)}
            data-testid="pagination-link"
        >
            {children}
        </a>
    ),
    PaginationPrevious: ({
        href,
        isDisabled,
        text,
    }: {
        href: string
        isDisabled?: boolean
        text: string
        "aria-label"?: string
    }) => (
        <a
            href={href}
            data-disabled={String(isDisabled)}
            data-testid="pagination-prev"
        >
            {text}
        </a>
    ),
    PaginationNext: ({
        href,
        isDisabled,
        text,
    }: {
        href: string
        isDisabled?: boolean
        text: string
        "aria-label"?: string
    }) => (
        <a
            href={href}
            data-disabled={String(isDisabled)}
            data-testid="pagination-next"
        >
            {text}
        </a>
    ),
    PaginationEllipsis: ({ label }: { label: string }) => (
        <span data-testid="pagination-ellipsis" aria-label={label}>
            ...
        </span>
    ),
}))

describe("PaginationComponent", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns null when totalPages is less than or equal to 1", async () => {
        const { container } = render(
            await PaginationComponent({
                totalPages: 1,
                page: 1,
                limit: 10,
                search: "",
                path: "users",
            }),
        )

        expect(container).toBeEmptyDOMElement()
    })

    it("renders pagination links and ellipsis correctly for multiple pages", async () => {
        render(
            await PaginationComponent({
                totalPages: 10,
                page: 5,
                limit: 10,
                search: "test",
                path: "users",
                sortBy: "email",
                sortOrder: "asc",
            }),
        )

        expect(screen.getByTestId("pagination-root")).toBeInTheDocument()

        const prevButton = screen.getByTestId("pagination-prev")
        const nextButton = screen.getByTestId("pagination-next")

        expect(prevButton).toHaveAttribute(
            "href",
            "/users?page=4&limit=10&search=test&sortBy=email&sortOrder=asc",
        )
        expect(nextButton).toHaveAttribute(
            "href",
            "/users?page=6&limit=10&search=test&sortBy=email&sortOrder=asc",
        )
        expect(prevButton).toHaveTextContent("Previous")
        expect(nextButton).toHaveTextContent("Next")

        const links = screen.getAllByTestId("pagination-link")
        const pageNumbers = links.map((link) => link.textContent)

        expect(pageNumbers).toEqual(["1", "4", "5", "6", "10"])

        const activeLink = links.find(
            (link) => link.getAttribute("data-active") === "true",
        )
        expect(activeLink).toHaveTextContent("5")

        const ellipses = screen.getAllByTestId("pagination-ellipsis")
        expect(ellipses.length).toBe(2)
    })

    it("disables previous button on the first page and next button on the last page", async () => {
        const { rerender } = render(
            await PaginationComponent({
                totalPages: 5,
                page: 1,
                limit: 10,
                search: "",
                path: "users",
            }),
        )

        expect(screen.getByTestId("pagination-prev")).toHaveAttribute(
            "data-disabled",
            "true",
        )
        expect(screen.getByTestId("pagination-next")).toHaveAttribute(
            "data-disabled",
            "false",
        )

        rerender(
            await PaginationComponent({
                totalPages: 5,
                page: 5,
                limit: 10,
                search: "",
                path: "users",
            }),
        )

        expect(screen.getByTestId("pagination-prev")).toHaveAttribute(
            "data-disabled",
            "false",
        )
        expect(screen.getByTestId("pagination-next")).toHaveAttribute(
            "data-disabled",
            "true",
        )
    })
})
