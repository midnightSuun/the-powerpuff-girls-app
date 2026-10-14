import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SearchInput } from "../search-input"

const replaceMock = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => "en",
}))

vi.mock("@/i18n/navigation", () => ({
    usePathname: () => "/users",
    useRouter: () => ({
        push: vi.fn(),
        replace: (...args: unknown[]) => replaceMock(...args),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        bfcacheId: "",
    }),
}))

describe("SearchInput", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders search input with placeholder and icons correctly", () => {
        render(<SearchInput />)

        const input = screen.getByPlaceholderText("search")
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute("type", "search")
    })

    it("updates input value and calls router.replace with debounced search query", async () => {
        render(<SearchInput limit={10} />)

        const input = screen.getByPlaceholderText("search")

        fireEvent.change(input, { target: { value: "john" } })

        expect(input).toHaveValue("john")
        expect(replaceMock).not.toHaveBeenCalled()

        await waitFor(
            () => {
                expect(replaceMock).toHaveBeenCalledTimes(1)
            },
            { timeout: 1000 },
        )

        expect(replaceMock).toHaveBeenCalledWith(
            "/users?page=1&limit=10&search=john",
            { scroll: false },
        )
    })
})
