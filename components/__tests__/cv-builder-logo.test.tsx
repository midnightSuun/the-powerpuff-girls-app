import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { CvBuilderLogo } from "../cv-builder-logo"

describe("CvBuilderLogo", () => {
    it("renders svg with correct default attributes", () => {
        const { container } = render(<CvBuilderLogo />)
        const svg = container.querySelector("svg")

        expect(svg).toBeInTheDocument()
        expect(svg).toHaveAttribute("viewBox", "0 0 24 24")
        expect(svg).toHaveAttribute("aria-hidden", "true")
    })

    it("applies custom className correctly", () => {
        const { container } = render(
            <CvBuilderLogo className="size-6 text-primary" />,
        )
        const svg = container.querySelector("svg")

        expect(svg).toHaveClass("size-6", "text-primary")
    })
})
