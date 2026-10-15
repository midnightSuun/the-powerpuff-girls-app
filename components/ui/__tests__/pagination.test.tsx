import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../pagination"

vi.mock("@/i18n/navigation", () => ({
    Link: ({
        children,
        href,
        "aria-current": ariaCurrent,
        className,
        ...props
    }: {
        children: ReactNode
        href: string
        "aria-current"?: string | boolean
        className?: string
    } & React.ComponentProps<"a">) => (
        <a
            href={href}
            aria-current={ariaCurrent}
            className={className}
            {...props}
        >
            {children}
        </a>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Pagination components", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders pagination container and content list", () => {
        render(
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationLink href="/page/1">1</PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>,
        )

        const nav = screen.getByRole("navigation")
        expect(nav).toBeInTheDocument()
        expect(nav).toHaveAttribute("data-slot", "pagination")

        const link = screen.getByRole("link", { name: "1" })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute("href", "/page/1")
    })

    it("applies active state correctly to PaginationLink", () => {
        render(
            <PaginationLink href="/page/2" isActive={true}>
                2
            </PaginationLink>,
        )

        const link = screen.getByRole("link", { name: "2" })
        expect(link).toHaveAttribute("aria-current", "page")
        expect(link).toHaveAttribute("data-active", "true")
    })

    it("renders disabled PaginationLink as a span with aria-disabled", () => {
        render(
            <PaginationLink href="/page/3" isDisabled={true}>
                3
            </PaginationLink>,
        )

        const disabledSpan = screen.getByText("3")
        expect(disabledSpan.tagName).toBe("SPAN")
        expect(disabledSpan).toHaveAttribute("aria-disabled", "true")
    })

    it("renders PaginationPrevious and PaginationNext with proper texts", () => {
        render(
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href="/page/1" text="Previous" />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext href="/page/3" text="Next" />
                </PaginationItem>
            </PaginationContent>,
        )

        expect(
            screen.getByRole("link", { name: /previous/i }),
        ).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /next/i })).toBeInTheDocument()
    })

    it("renders PaginationEllipsis with accessible sr-only label", () => {
        render(<PaginationEllipsis label="More pages" />)

        const ellipsisLabel = screen.getByText("More pages")
        expect(ellipsisLabel).toBeInTheDocument()
        expect(ellipsisLabel).toHaveClass("sr-only")
    })
})
