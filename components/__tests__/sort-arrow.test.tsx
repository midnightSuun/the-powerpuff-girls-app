import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SortArrow } from "../sort-arrow"

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("SortArrow", () => {
    it("renders sort arrow image with correct attributes", () => {
        render(<SortArrow descending={false} />)

        const arrow = screen.getByAltText("sort arrow")
        expect(arrow).toBeInTheDocument()
        expect(arrow).toHaveAttribute("src", "/sort-arrow.svg")
        expect(arrow).toHaveAttribute("width", "12")
        expect(arrow).toHaveAttribute("height", "12")
    })

    it("does not apply rotate-180 class when descending is false", () => {
        render(<SortArrow descending={false} />)

        const arrow = screen.getByAltText("sort arrow")
        expect(arrow).toHaveClass("shrink-0")
        expect(arrow).not.toHaveClass("rotate-180")
    })

    it("applies rotate-180 class when descending is true", () => {
        render(<SortArrow descending={true} />)

        const arrow = screen.getByAltText("sort arrow")
        expect(arrow).toHaveClass("shrink-0")
        expect(arrow).toHaveClass("rotate-180")
    })
})
