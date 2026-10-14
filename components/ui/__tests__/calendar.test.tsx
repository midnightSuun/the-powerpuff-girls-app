import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Calendar } from "../calendar"

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Calendar component", () => {
    const defaultProps = {
        value: "2026-06-15",
        onChange: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders calendar with current month and year based on value", () => {
        render(<Calendar {...defaultProps} />)

        expect(
            screen.getByRole("button", { name: /june/i }),
        ).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "2026" })).toBeInTheDocument()

        expect(screen.getByText("Mo")).toBeInTheDocument()
        expect(screen.getByText("Su")).toBeInTheDocument()
    })

    it("calls onChange with formatted ISO date when a valid day is clicked", () => {
        const onChange = vi.fn()
        render(<Calendar {...defaultProps} onChange={onChange} />)

        const dayButtons = screen.getAllByRole("button", { name: "10" })
        const activeDayButton = dayButtons.find(
            (btn) => !btn.hasAttribute("disabled"),
        )

        expect(activeDayButton).toBeDefined()
        if (activeDayButton) {
            fireEvent.click(activeDayButton)
        }

        expect(onChange).toHaveBeenCalledWith("2026-06-10")
    })

    it("switches to months view when month button is clicked", () => {
        render(<Calendar {...defaultProps} />)

        const monthButton = screen.getByRole("button", { name: /june/i })
        fireEvent.click(monthButton)

        expect(
            screen.getByRole("button", { name: "January" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "December" }),
        ).toBeInTheDocument()
    })

    it("switches to years view when year button is clicked", () => {
        render(<Calendar {...defaultProps} />)

        const headerYearButton = screen.getAllByRole("button", {
            name: "2026",
        })[0]
        fireEvent.click(headerYearButton)

        expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument()
    })

    it("handles next and previous navigation in days view", () => {
        render(<Calendar {...defaultProps} />)

        expect(
            screen.getByRole("button", { name: /june/i }),
        ).toBeInTheDocument()

        const nextButton = document
            .querySelector("svg.lucide-chevron-right")
            ?.closest("button")
        expect(nextButton).toBeInTheDocument()

        if (nextButton) {
            fireEvent.click(nextButton)
            expect(
                screen.getByRole("button", { name: /july/i }),
            ).toBeInTheDocument()
        }
    })
})
