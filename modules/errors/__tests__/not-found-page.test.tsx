import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useRouter } from "@/i18n/navigation"

import { NotFoundPage } from "../ui/not-found-page"

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        if (key === "description") {
            return "Line 1\nLine 2"
        }
        return key
    },
}))

describe("NotFoundPage", () => {
    const mockPush = vi.fn()

    type AppRouter = ReturnType<typeof useRouter>

    const mockRouter: AppRouter = {
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        bfcacheId: "",
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue(mockRouter)
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
        expect(screen.getByText("Line 1")).toBeInTheDocument()
        expect(screen.getByText("Line 2")).toBeInTheDocument()
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
