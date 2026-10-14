import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NavUserMenuItem } from "../ui/nav-user-menu-item"

vi.mock("@/i18n/navigation", () => ({
    Link: vi.fn(({ href, children, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    )),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenuItem: vi.fn(
        ({ children, onClick, variant, className, render, ...props }) => {
            if (render) {
                return (
                    <div
                        data-testid="dropdown-menu-item"
                        data-variant={variant}
                        className={className}
                        onClick={onClick}
                        {...props}
                    >
                        {typeof render === "object" &&
                        render !== null &&
                        "type" in render
                            ? {
                                  ...render,
                                  props: { ...render.props, children },
                              }
                            : render}
                    </div>
                )
            }
            return (
                <button
                    type="button"
                    data-testid="dropdown-menu-item"
                    data-variant={variant}
                    className={className}
                    onClick={onClick}
                    {...props}
                >
                    {children}
                </button>
            )
        },
    ),
}))

describe("NavUserMenuItem Component", () => {
    const mockIcon = <span data-testid="menu-icon">📁</span>
    const mockOnClick = vi.fn()

    it("renders regular menu item with label, icon and handles click", async () => {
        render(
            <NavUserMenuItem
                label="Profile"
                icon={mockIcon}
                onClick={mockOnClick}
                itemClassName="custom-item-class"
                labelClassName="custom-label-class"
            />,
        )

        const item = screen.getByTestId("dropdown-menu-item")
        expect(item).toBeInTheDocument()
        expect(item).toHaveClass("custom-item-class")

        const icon = screen.getByTestId("menu-icon")
        expect(icon).toBeInTheDocument()

        const label = screen.getByText("Profile")
        expect(label).toBeInTheDocument()
        expect(label).toHaveClass("custom-label-class")

        await userEvent.click(item)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it("renders with destructive variant correctly", () => {
        render(
            <NavUserMenuItem
                label="Delete"
                icon={mockIcon}
                variant="destructive"
                onClick={mockOnClick}
            />,
        )

        const item = screen.getByTestId("dropdown-menu-item")
        expect(item).toHaveAttribute("data-variant", "destructive")
    })

    it("renders as link when href is provided", async () => {
        render(
            <NavUserMenuItem
                label="Settings"
                icon={mockIcon}
                href="/settings"
                onClick={mockOnClick}
            />,
        )

        const link = screen.getByRole("link", { name: /settings/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute("href", "/settings")

        const item = screen.getByTestId("dropdown-menu-item")
        await userEvent.click(item)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
})
