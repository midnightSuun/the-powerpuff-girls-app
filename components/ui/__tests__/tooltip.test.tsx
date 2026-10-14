import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../tooltip"

vi.mock("@base-ui/react/tooltip", () => ({
    Tooltip: {
        Provider: ({ children }: { children: ReactNode; delay?: number }) => (
            <div data-slot="tooltip-provider">{children}</div>
        ),
        Root: ({ children }: { children: ReactNode }) => {
            const [isOpen, setIsOpen] = useState(false)
            return (
                <div
                    data-slot="tooltip"
                    data-state={isOpen ? "open" : "closed"}
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {children}
                </div>
            )
        },
        Trigger: ({
            children,
            ...props
        }: {
            children: ReactNode
        } & React.ComponentProps<"button">) => (
            <button type="button" data-slot="tooltip-trigger" {...props}>
                {children}
            </button>
        ),
        Portal: ({ children }: { children: ReactNode }) => (
            <div data-slot="tooltip-portal">{children}</div>
        ),
        Positioner: ({ children }: { children: ReactNode }) => (
            <div data-slot="tooltip-positioner">{children}</div>
        ),
        Popup: ({
            children,
            className,
        }: {
            children: ReactNode
            className?: string
        }) => {
            return (
                <div
                    role="tooltip"
                    data-slot="tooltip-content"
                    className={className}
                >
                    {children}
                </div>
            )
        },
        Arrow: () => <div data-slot="tooltip-arrow" />,
    },
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Tooltip components", () => {
    it("renders tooltip trigger correctly within provider", () => {
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>Hover me</TooltipTrigger>
                    <TooltipContent>Tooltip info</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        )

        expect(
            screen.getByRole("button", { name: "Hover me" }),
        ).toBeInTheDocument()

        const provider = document.querySelector(
            '[data-slot="tooltip-provider"]',
        )
        expect(provider).toBeInTheDocument()
    })

    it("shows tooltip content when hovered/activated", () => {
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>Hover me</TooltipTrigger>
                    <TooltipContent side="top">Tooltip info</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        )

        const trigger = screen.getByRole("button", { name: "Hover me" })

        fireEvent.mouseEnter(trigger)

        const tooltipContent = screen.getByRole("tooltip")
        expect(tooltipContent).toBeInTheDocument()
        expect(tooltipContent).toHaveTextContent("Tooltip info")
        expect(tooltipContent).toHaveAttribute("data-slot", "tooltip-content")
    })
})
