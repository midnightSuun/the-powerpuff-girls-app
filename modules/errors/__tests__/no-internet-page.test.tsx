import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NoInternetPage } from "../ui/no-internet-page"

describe("NoInternetPage", () => {
    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders with default icon, translated content, and action text", () => {
        render(<NoInternetPage />)

        const img = screen.getByRole("img", { name: "title" })
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute("src", "/network-error-icon.svg")

        expect(
            screen.getByRole("heading", { name: "title" }),
        ).toBeInTheDocument()
        expect(screen.getByText("description")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "actionText" }),
        ).toBeInTheDocument()
    })

    it("accepts and uses custom iconSrc prop", () => {
        render(<NoInternetPage iconSrc="/custom-offline.svg" />)

        const img = screen.getByRole("img", { name: "title" })
        expect(img).toHaveAttribute("src", "/custom-offline.svg")
    })

    it("triggers onRetry handler when action button is clicked", async () => {
        const user = userEvent.setup()
        const mockOnRetry = vi.fn()

        render(<NoInternetPage onRetry={mockOnRetry} />)

        const button = screen.getByRole("button", { name: "actionText" })
        await user.click(button)

        expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })
})
