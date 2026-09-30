import { cn } from "cn"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from "lucide-react"
import * as React from "react"

import { Link } from "@/i18n/navigation"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            {...props}
        />
    )
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn(
                "flex flex-wrap items-center justify-center gap-1.5",
                className,
            )}
            {...props}
        />
    )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean
    isDisabled?: boolean
} & React.ComponentProps<typeof Link>

const PaginationLink = ({
    className,
    isActive = false,
    isDisabled = false,
    href = "",
    children,
    ...props
}: PaginationLinkProps) => {
    const classes = cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive
            ? "border-button-primary-default bg-button-primary-default text-text-primary-default shadow-sm"
            : "border-border bg-background text-foreground hover:border-button-primary-default/50 hover:bg-muted",
        isDisabled &&
            "pointer-events-none border-transparent bg-transparent text-muted-foreground opacity-40",
        className,
    )

    if (isDisabled) {
        return (
            <span
                aria-disabled="true"
                data-slot="pagination-link"
                className={classes}
            >
                {children}
            </span>
        )
    }

    return (
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={classes}
            {...props}
        >
            {children}
        </Link>
    )
}

const PaginationPrevious = ({
    className,
    text = "Previous",
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) => {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            className={cn("px-3", className)}
            {...props}
        >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">{text}</span>
        </PaginationLink>
    )
}

const PaginationNext = ({
    className,
    text = "Next",
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) => {
    return (
        <PaginationLink
            aria-label="Go to next page"
            className={cn("px-3", className)}
            {...props}
        >
            <span className="hidden sm:inline">{text}</span>
            <ChevronRightIcon className="size-4" />
        </PaginationLink>
    )
}

const PaginationEllipsis = ({
    className,
    ...props
}: React.ComponentProps<"span">) => {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn(
                "flex size-9 items-center justify-center text-muted-foreground",
                className,
            )}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    )
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
}
