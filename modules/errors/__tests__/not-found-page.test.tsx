import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useRouter } from "@/i18n/navigation"

import { NotFoundPage } from "../ui/not-found-page"

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
}))

describe("NotFoundPage", () => {
    const mockPush = vi.fn()

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
        } as unknown as ReturnType<typeof useRouter>)
    })

    afterEach(() => {
        cleanup()
    })

    it("renders core elements with translations and icon correctly", () => {
        render(<NotFoundPage />)

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

    it("navigates to home page using router.push when action button is clicked", async () => {
        const user = userEvent.setup()

        render(<NotFoundPage />)

        const button = screen.getByRole("button", { name: "actionText" })
        await user.click(button)

        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith("/")
    })
})
