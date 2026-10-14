import { cleanup, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MobileScreenBlocker } from "../ui/mobile-screen-blocker"

vi.mock("@/modules/errors/ui/error-template", () => ({
    ErrorTemplate: ({
        title,
        description,
    }: {
        title: string
        description: React.ReactNode
    }) => (
        <main data-testid="error-template">
            <h1>{title}</h1>
            <p>{description}</p>
        </main>
    ),
}))

describe("MobileScreenBlocker", () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it("renders both desktop content and error template with correct CSS visibility classes", () => {
        render(
            <MobileScreenBlocker>
                <div data-testid="desktop-content">Protected Content</div>
            </MobileScreenBlocker>,
        )

        expect(screen.getByTestId("desktop-content")).toBeInTheDocument()
        expect(screen.getByTestId("error-template")).toBeInTheDocument()

        const desktopWrapper =
            screen.getByTestId("desktop-content").parentElement
        expect(desktopWrapper).toHaveClass("max-md:hidden")

        const errorWrapper = screen.getByTestId("error-template").parentElement
        expect(errorWrapper).toHaveClass("hidden")
        expect(errorWrapper).toHaveClass("max-md:block")
    })
})
