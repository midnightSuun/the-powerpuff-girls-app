import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "../dropdown-menu"

vi.mock("@base-ui/react/menu", () => ({
    Menu: {
        Root: ({ children }: { children: ReactNode }) => (
            <div data-slot="dropdown-menu" data-state="closed">
                {children}
            </div>
        ),
        Portal: ({ children }: { children: ReactNode }) => (
            <div data-slot="dropdown-menu-portal">{children}</div>
        ),
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
                data-slot="dropdown-menu-trigger"
                onClick={(e) => {
                    onClick?.()
                    const root = e.currentTarget.closest(
                        '[data-slot="dropdown-menu"]',
                    )
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
        Positioner: ({
            children,
            className,
        }: {
            children: ReactNode
            className?: string
        }) => <div className={className}>{children}</div>,
        Popup: ({
            children,
            className,
            ...props
        }: {
            children: ReactNode
            className?: string
        } & React.ComponentProps<"div">) => (
            <div
                role="menu"
                data-slot="dropdown-menu-content"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        Group: ({
            children,
            ...props
        }: { children: ReactNode } & React.ComponentProps<"div">) => (
            <div data-slot="dropdown-menu-group" {...props}>
                {children}
            </div>
        ),
        GroupLabel: ({
            children,
            className,
            ...props
        }: {
            children: ReactNode
            className?: string
        } & React.ComponentProps<"div">) => (
            <div
                data-slot="dropdown-menu-label"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        Item: ({
            children,
            onClick,
            className,
            ...props
        }: {
            children: ReactNode
            onClick?: (e: React.MouseEvent<HTMLElement>) => void
            className?: string
        } & React.ComponentProps<"div">) => (
            <div
                role="menuitem"
                data-slot="dropdown-menu-item"
                className={className}
                onClick={(e) => onClick?.(e)}
                {...props}
            >
                {children}
            </div>
        ),
        SubmenuRoot: ({ children }: { children: ReactNode }) => (
            <div>{children}</div>
        ),
        SubmenuTrigger: ({
            children,
            className,
            ...props
        }: {
            children: ReactNode
            className?: string
        } & React.ComponentProps<"div">) => (
            <div
                role="menuitem"
                data-slot="dropdown-menu-sub-trigger"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        CheckboxItem: ({
            children,
            checked,
            onCheckedChange,
            className,
            ...props
        }: {
            children: ReactNode
            checked?: boolean
            onCheckedChange?: (checked: boolean) => void
            className?: string
        } & React.ComponentProps<"div">) => (
            <div
                role="menuitemcheckbox"
                aria-checked={checked}
                data-slot="dropdown-menu-checkbox-item"
                className={className}
                onClick={() => onCheckedChange?.(!checked)}
                {...props}
            >
                {children}
            </div>
        ),
        CheckboxItemIndicator: ({ children }: { children: ReactNode }) => (
            <span data-slot="dropdown-menu-checkbox-item-indicator">
                {children}
            </span>
        ),
        RadioGroup: ({
            children,
            value,
            onValueChange,
            ...props
        }: {
            children: ReactNode
            value?: string
            onValueChange?: (val: string) => void
        } & React.ComponentProps<"div">) => (
            <div data-slot="dropdown-menu-radio-group" {...props}>
                {children}
            </div>
        ),
        RadioItem: ({
            children,
            value,
            className,
            ...props
        }: {
            children: ReactNode
            value?: string
            className?: string
        } & React.ComponentProps<"div">) => (
            <div
                role="menuitemradio"
                data-slot="dropdown-menu-radio-item"
                className={className}
                {...props}
            >
                {children}
            </div>
        ),
        RadioItemIndicator: ({ children }: { children: ReactNode }) => (
            <span data-slot="dropdown-menu-radio-item-indicator">
                {children}
            </span>
        ),
        Separator: ({
            className,
            ...props
        }: { className?: string } & React.ComponentProps<"div">) => (
            <div
                data-slot="dropdown-menu-separator"
                className={className}
                {...props}
            />
        ),
    },
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("DropdownMenu components", () => {
    it("renders trigger and opens menu content on click", () => {
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        )

        const trigger = screen.getByRole("button", { name: "Actions" })
        expect(trigger).toBeInTheDocument()

        fireEvent.click(trigger)

        expect(screen.getByRole("menu")).toBeInTheDocument()
        expect(screen.getByText("My Account")).toBeInTheDocument()
        expect(screen.getByText("Profile")).toBeInTheDocument()
        expect(screen.getByText("Delete")).toBeInTheDocument()
    })

    it("handles item selection correctly", () => {
        const handleSelect = vi.fn()
        render(
            <DropdownMenu>
                <DropdownMenuTrigger>Open</DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleSelect}>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        )

        fireEvent.click(screen.getByRole("button", { name: "Open" }))

        const item = screen.getByText("Settings")
        expect(item).toBeInTheDocument()
        expect(screen.getByText("⌘S")).toBeInTheDocument()

        fireEvent.click(item)
        expect(handleSelect).toHaveBeenCalledTimes(1)
    })

    it("toggles checkbox item state", () => {
        function TestCheckboxWrapper() {
            const [checked, setChecked] = useState(false)
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger>Toggle</DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                            checked={checked}
                            onCheckedChange={setChecked}
                        >
                            Status Bar
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }

        render(<TestCheckboxWrapper />)

        fireEvent.click(screen.getByRole("button", { name: "Toggle" }))

        const checkboxItem = screen.getByRole("menuitemcheckbox")
        expect(checkboxItem).toHaveAttribute("aria-checked", "false")

        fireEvent.click(checkboxItem)
        expect(checkboxItem).toHaveAttribute("aria-checked", "true")
    })
})
