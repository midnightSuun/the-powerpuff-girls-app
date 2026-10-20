import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ErrorTemplate } from "../ui/error-template"

describe("ErrorTemplate", () => {
    const mockReload = vi.fn()

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { reload: mockReload },
        })
    })

    afterEach(() => {
        cleanup()
    })

    it("renders core elements with default retry text when actionText is omitted", () => {
        render(
            <ErrorTemplate
                iconSrc="/error-icon.svg"
                title="Something went wrong"
                description="An unexpected error occurred."
            />,
        )

        const img = screen.getByRole("img", { name: "Something went wrong" })
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute("src", "/error-icon.svg")

        expect(
            screen.getByRole("heading", { name: "Something went wrong" }),
        ).toBeInTheDocument()
        expect(
            screen.getByText("An unexpected error occurred."),
        ).toBeInTheDocument()

        expect(
            screen.getByRole("button", { name: "retry" }),
        ).toBeInTheDocument()
    })

    it("renders custom action text when provided as a string", () => {
        render(
            <ErrorTemplate
                iconSrc="/error-icon.svg"
                title="Error"
                description="Description text"
                actionText="Go Back"
            />,
        )

        expect(
            screen.getByRole("button", { name: "Go Back" }),
        ).toBeInTheDocument()
    })

    it("renders default retry text when actionText is explicitly undefined", () => {
        render(
            <ErrorTemplate
                iconSrc="/error-icon.svg"
                title="Error"
                description="Description text"
                actionText={undefined}
            />,
        )

        expect(
            screen.getByRole("button", { name: "retry" }),
        ).toBeInTheDocument()
    })

    it("calls custom onAction handler when the action button is clicked", async () => {
        const user = userEvent.setup()
        const mockOnAction = vi.fn()

        render(
            <ErrorTemplate
                iconSrc="/error-icon.svg"
                title="Error"
                description="Description text"
                onAction={mockOnAction}
            />,
        )

        const button = screen.getByRole("button", { name: "retry" })
        await user.click(button)

        expect(mockOnAction).toHaveBeenCalledTimes(1)
        expect(mockReload).not.toHaveBeenCalled()
    })

    it("reloads window location when action button is clicked and onAction is not provided", async () => {
        const user = userEvent.setup()

        render(
            <ErrorTemplate
                iconSrc="/error-icon.svg"
                title="Error"
                description="Description text"
            />,
        )

        const button = screen.getByRole("button", { name: "retry" })
        await user.click(button)

        expect(mockReload).toHaveBeenCalledTimes(1)
    })
})
