import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProgressItem } from "../progress-item"

describe("ProgressItem component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders item name correctly", () => {
        render(<ProgressItem name="TypeScript" mastery="Expert" />)

        expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })

    it("applies default text styling when isSelected is false", () => {
        render(<ProgressItem name="JavaScript" mastery={3} />)

        const nameSpan = screen.getByText("JavaScript")
        expect(nameSpan).toHaveClass("text-muted-foreground")
        expect(nameSpan).not.toHaveClass("text-red-600 font-medium")
    })

    it("applies selected text styling when isSelected is true", () => {
        render(<ProgressItem name="React" mastery="C1" isSelected={true} />)

        const nameSpan = screen.getByText("React")
        expect(nameSpan).toHaveClass("text-red-600 font-medium")
    })

    it("handles different mastery levels correctly (e.g., numeric, string levels)", () => {
        const { rerender } = render(<ProgressItem name="Skill A" mastery={0} />)
        expect(screen.getByText("Skill A")).toBeInTheDocument()

        rerender(<ProgressItem name="Skill B" mastery="A1" />)
        expect(screen.getByText("Skill B")).toBeInTheDocument()

        rerender(<ProgressItem name="Skill C" mastery="Competent" />)
        expect(screen.getByText("Skill C")).toBeInTheDocument()
    })

    it("falls back to proficient style for unknown mastery levels", () => {
        render(<ProgressItem name="Unknown Skill" mastery="UnknownLevel" />)

        expect(screen.getByText("Unknown Skill")).toBeInTheDocument()
    })
})
