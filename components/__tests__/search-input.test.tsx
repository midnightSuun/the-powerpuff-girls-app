import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SearchInput } from "../search-input"

const replaceMock = vi.fn()
const mockSearchParamsGet = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => "en",
}))

vi.mock("next/navigation", () => ({
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
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
        mockSearchParamsGet.mockReturnValue("")
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

    it("syncs input value when external search param changes", () => {
        mockSearchParamsGet.mockReturnValue("alice")

        const { rerender } = render(<SearchInput limit={10} search="" />)

        const input = screen.getByPlaceholderText("search")
        expect(input).toHaveValue("alice")

        // Simulate external URL change (e.g., browser back button)
        mockSearchParamsGet.mockReturnValue("bob")

        rerender(<SearchInput limit={10} search="" />)

        expect(input).toHaveValue("bob")
    })

    it("does not override user input when search param changes but user has typed", () => {
        mockSearchParamsGet.mockReturnValue("initial")

        const { rerender } = render(<SearchInput limit={10} search="" />)

        const input = screen.getByPlaceholderText("search")
        expect(input).toHaveValue("initial")

        // User types something different
        fireEvent.change(input, { target: { value: "user-typed" } })
        expect(input).toHaveValue("user-typed")

        // External search param changes to something else
        mockSearchParamsGet.mockReturnValue("external-change")

        rerender(<SearchInput limit={10} search="" />)

        // Input should keep user's typed value, not sync to external change
        expect(input).toHaveValue("user-typed")
    })

    it("syncs to external change when user has not modified input", () => {
        mockSearchParamsGet.mockReturnValue("first")

        const { rerender } = render(<SearchInput limit={10} search="" />)

        let input = screen.getByPlaceholderText("search")
        expect(input).toHaveValue("first")

        // External param changes and user hasn't typed anything different
        mockSearchParamsGet.mockReturnValue("second")

        rerender(<SearchInput limit={10} search="" />)

        input = screen.getByPlaceholderText("search")
        expect(input).toHaveValue("second")
    })
})
