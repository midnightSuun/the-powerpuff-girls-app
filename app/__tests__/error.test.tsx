import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import ErrorBoundary from "../[locale]/error"

vi.mock("@/modules/errors/ui/no-internet-page", () => ({
    NoInternetPage: ({
        onRetry,
        iconSrc,
    }: {
        onRetry: () => void
        iconSrc: string
    }) => (
        <div data-testid="no-internet-page">
            <button type="button" onClick={onRetry} data-testid="retry-button">
                Retry
            </button>
            <span data-testid="icon-src">{iconSrc}</span>
        </div>
    ),
}))

describe("ErrorBoundary component", () => {
    const mockError = new Error("Test application error")
    const mockReset = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, "error").mockImplementation(() => {})
    })

    it("logs error to console and renders NoInternetPage with correct props on mount", () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />)

        expect(console.error).toHaveBeenCalledWith(
            "Application error:",
            mockError,
        )

        expect(screen.getByTestId("no-internet-page")).toBeInTheDocument()
        expect(screen.getByTestId("icon-src")).toHaveTextContent(
            "/network-error-icon.svg",
        )
    })

    it("triggers reset callback when retry action is called", () => {
        render(<ErrorBoundary error={mockError} reset={mockReset} />)

        const retryButton = screen.getByTestId("retry-button")
        fireEvent.click(retryButton)

        expect(mockReset).toHaveBeenCalledTimes(1)
    })
})
