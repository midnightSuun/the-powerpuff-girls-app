import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import RootLayout from "../layout"

vi.mock("../fonts", () => ({
    geistSans: { variable: "--font-geist-sans" },
    geistMono: { variable: "--font-geist-mono" },
    roboto: { variable: "--font-roboto" },
    robotoCyrillic: { variable: "--font-roboto-cyrillic" },
    robotoCyrillicExt: { variable: "--font-roboto-cyrillic-ext" },
}))

vi.mock("@/components/theme-provider", () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="theme-provider">{children}</div>
    ),
}))

describe("RootLayout component", () => {
    it("renders html, body, theme provider and children correctly", () => {
        render(
            <RootLayout>
                <div data-testid="child-content">Test Child Content</div>
            </RootLayout>,
        )

        const themeProvider = screen.getByTestId("theme-provider")
        expect(themeProvider).toBeInTheDocument()

        const childContent = screen.getByTestId("child-content")
        expect(childContent).toBeInTheDocument()
        expect(childContent).toHaveTextContent("Test Child Content")

        const body = document.querySelector("body")
        expect(body).toHaveClass("min-h-full", "flex", "flex-col", "font-sans")

        const html = document.querySelector("html")
        expect(html).toHaveAttribute("lang", "en")
    })
})
