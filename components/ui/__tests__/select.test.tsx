import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "../select"

vi.mock("@base-ui/react/select", () => ({
    Select: {
        Root: ({ children }: { children: ReactNode }) => {
            return (
                <div data-slot="select" data-state="closed">
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
            onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
        } & React.ComponentProps<"button">) => (
            <button
                type="button"
                role="combobox"
                data-slot="select-trigger"
                onClick={(e) => {
                    onClick?.(e)
                    const root = e.currentTarget.closest('[data-slot="select"]')
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
        Value: ({
            children,
            placeholder,
        }: {
            children?: ReactNode
            placeholder?: string
        }) => <span data-slot="select-value">{children || placeholder}</span>,
        Icon: () => <span data-slot="select-icon" />,
        Portal: ({ children }: { children: ReactNode }) => (
            <div data-slot="select-portal">{children}</div>
        ),
        Positioner: ({ children }: { children: ReactNode }) => (
            <div data-slot="select-positioner">{children}</div>
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
                    role="listbox"
                    data-slot="select-content"
                    className={className}
                >
                    {children}
                </div>
            )
        },
        List: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        Group: ({
            children,
            className,
        }: {
            children: ReactNode
            className?: string
        }) => (
            <div data-slot="select-group" className={className}>
                {children}
            </div>
        ),
        GroupLabel: ({
            children,
            className,
        }: {
            children: ReactNode
            className?: string
        }) => (
            <div data-slot="select-label" className={className}>
                {children}
            </div>
        ),
        Item: ({
            children,
            value,
            onClick,
        }: {
            children: ReactNode
            value: string
            onClick?: () => void
        }) => (
            <div
                role="option"
                data-slot="select-item"
                data-value={value}
                onClick={onClick}
            >
                {children}
            </div>
        ),
        ItemText: ({ children }: { children: ReactNode }) => (
            <span>{children}</span>
        ),
        ItemIndicator: ({ children }: { children: ReactNode }) => (
            <span>{children}</span>
        ),
        Separator: ({ className }: { className?: string }) => (
            <div data-slot="select-separator" className={className} />
        ),
        ScrollUpArrow: () => null,
        ScrollDownArrow: () => null,
    },
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Select components", () => {
    it("renders trigger and placeholder correctly", () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">Option 1</SelectItem>
                </SelectContent>
            </Select>,
        )

        const trigger = screen.getByRole("combobox")
        expect(trigger).toBeInTheDocument()
        expect(screen.getByText("Select an option")).toBeInTheDocument()
    })

    it("opens content list and displays items when clicked", () => {
        render(
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Choose fruit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Fruits</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectSeparator />
                        <SelectItem value="banana">Banana</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>,
        )

        fireEvent.click(screen.getByRole("combobox"))

        expect(screen.getByRole("listbox")).toBeInTheDocument()
        expect(screen.getByText("Fruits")).toBeInTheDocument()
        expect(screen.getByText("Apple")).toBeInTheDocument()
        expect(screen.getByText("Banana")).toBeInTheDocument()

        const separator = document.querySelector(
            '[data-slot="select-separator"]',
        )
        expect(separator).toBeInTheDocument()
    })
})
