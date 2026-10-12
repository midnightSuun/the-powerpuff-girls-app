import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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
    const originalInnerWidth = window.innerWidth

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        })
    })

    const setWindowWidth = (width: number) => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: width,
        })
        act(() => {
            window.dispatchEvent(new Event("resize"))
        })
    }

    it("renders children when screen width is desktop size (>= 768px)", () => {
        setWindowWidth(1024)

        render(
            <MobileScreenBlocker>
                <div data-testid="desktop-content">Protected Content</div>
            </MobileScreenBlocker>,
        )

        expect(screen.getByTestId("desktop-content")).toBeInTheDocument()
        expect(screen.queryByTestId("error-template")).not.toBeInTheDocument()
    })

    it("renders ErrorTemplate when screen width is mobile size (< 768px)", () => {
        setWindowWidth(500)

        render(
            <MobileScreenBlocker>
                <div data-testid="desktop-content">Protected Content</div>
            </MobileScreenBlocker>,
        )

        expect(screen.getByTestId("error-template")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "title" }),
        ).toBeInTheDocument()
        expect(screen.getByText("description")).toBeInTheDocument()
        expect(screen.queryByTestId("desktop-content")).not.toBeInTheDocument()
    })

    it("updates view dynamically when window is resized from desktop to mobile", () => {
        setWindowWidth(1024)

        render(
            <MobileScreenBlocker>
                <div data-testid="desktop-content">Protected Content</div>
            </MobileScreenBlocker>,
        )

        expect(screen.getByTestId("desktop-content")).toBeInTheDocument()

        setWindowWidth(600)

        expect(screen.queryByTestId("desktop-content")).not.toBeInTheDocument()
        expect(screen.getByTestId("error-template")).toBeInTheDocument()
    })
})
