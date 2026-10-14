import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { ThemeProvider } from "../theme-provider"

vi.mock("next-themes", () => ({
    ThemeProvider: ({
        children,
        attribute,
        defaultTheme,
    }: {
        children: React.ReactNode
        attribute?: string
        defaultTheme?: string
    }) => (
        <div
            data-testid="next-themes-provider"
            data-attribute={attribute}
            data-default-theme={defaultTheme}
        >
            {children}
        </div>
    ),
}))

describe("ThemeProvider", () => {
    it("renders children correctly", () => {
        render(
            <ThemeProvider>
                <div data-testid="child-element">Test Content</div>
            </ThemeProvider>,
        )

        expect(screen.getByTestId("child-element")).toBeInTheDocument()
        expect(screen.getByText("Test Content")).toBeInTheDocument()
    })

    it("passes props down to NextThemesProvider correctly", () => {
        render(
            <ThemeProvider attribute="class" defaultTheme="system">
                <span>Theme Content</span>
            </ThemeProvider>,
        )

        const provider = screen.getByTestId("next-themes-provider")
        expect(provider).toBeInTheDocument()
        expect(provider).toHaveAttribute("data-attribute", "class")
        expect(provider).toHaveAttribute("data-default-theme", "system")
    })
})
