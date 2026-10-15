import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../dialog"

vi.mock("@base-ui/react/dialog", () => ({
    Dialog: {
        Root: ({ children }: { children: ReactNode }) => {
            return (
                <div data-slot="dialog" data-state="closed">
                    {children}
                </div>
            )
        },
        Trigger: ({
            children,
            onClick,
            ...props
        }: {
            children: ReactNode
            onClick?: () => void
        } & React.ComponentProps<"button">) => (
            <button
                type="button"
                data-slot="dialog-trigger"
                onClick={(e) => {
                    onClick?.()
                    const root = e.currentTarget.closest('[data-slot="dialog"]')
                    if (root) {
                        const isOpen =
                            root.getAttribute("data-state") === "open"
                        root.setAttribute(
                            "data-state",
                            isOpen ? "closed" : "open",
                        )
                    }
                }}
                {...props}
            >
                {children}
            </button>
        ),
        Portal: ({ children }: { children: ReactNode }) => {
            return <div data-slot="dialog-portal">{children}</div>
        },
        Backdrop: ({
            className,
            ...props
        }: { className?: string } & React.ComponentProps<"div">) => (
            <div data-slot="dialog-overlay" className={className} {...props} />
        ),
        Popup: ({
            children,
            className,
            ...props
        }: {
            children: ReactNode
            className?: string
        } & React.ComponentProps<"div">) => {
            return (
                <div
                    role="dialog"
                    data-slot="dialog-content"
                    className={className}
                    {...props}
                >
                    {children}
                </div>
            )
        },
        Close: ({
            children,
            onClick,
            ...props
        }: {
            children?: ReactNode
            onClick?: (e: React.MouseEvent<HTMLElement>) => void
        } & React.ComponentProps<"button">) => {
            return (
                <button
                    type="button"
                    data-slot="dialog-close"
                    onClick={(e) => {
                        onClick?.(e)
                    }}
                    {...props}
                >
                    {children}
                </button>
            )
        },
        Title: ({
            children,
            className,
            ...props
        }: {
            children: ReactNode
            className?: string
        } & React.ComponentProps<"h2">) => (
            <h2 data-slot="dialog-title" className={className} {...props}>
                {children}
            </h2>
        ),
        Description: ({
            children,
            className,
            ...props
        }: {
            children: ReactNode
            className?: string
        } & React.ComponentProps<"p">) => (
            <p data-slot="dialog-description" className={className} {...props}>
                {children}
            </p>
        ),
    },
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Dialog components", () => {
    it("renders trigger and opens dialog content when clicked", () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter showCloseButton={true}>
                        <button type="button">Confirm</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>,
        )

        const trigger = screen.getByRole("button", { name: "Open Dialog" })
        expect(trigger).toBeInTheDocument()

        fireEvent.click(trigger)

        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText("Are you sure?")).toBeInTheDocument()
        expect(
            screen.getByText("This action cannot be undone."),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Confirm" }),
        ).toBeInTheDocument()

        const closeButtons = screen.getAllByRole("button", { name: /close/i })
        expect(closeButtons.length).toBeGreaterThanOrEqual(1)
    })

    it("renders default close icon button in content when showCloseButton is true", () => {
        render(
            <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent showCloseButton={true}>
                    <DialogTitle>Modal Title</DialogTitle>
                </DialogContent>
            </Dialog>,
        )

        fireEvent.click(screen.getByRole("button", { name: "Open" }))
        const closeButton = screen.getByRole("button", { name: /close/i })
        expect(closeButton).toBeInTheDocument()
    })

    it("does not render default close icon button when showCloseButton is false", () => {
        render(
            <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent showCloseButton={false}>
                    <DialogTitle>Modal Title</DialogTitle>
                </DialogContent>
            </Dialog>,
        )

        fireEvent.click(screen.getByRole("button", { name: "Open" }))

        const closeButtons = screen.queryAllByText("Close")
        expect(closeButtons).toHaveLength(0)
    })
})
