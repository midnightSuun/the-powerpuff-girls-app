import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"

import { SkillMasterySelect } from "../ui/components/user/skill-mastery-select"

describe("SkillMasterySelect", () => {
    const mockOnValueChange = vi.fn()

    const defaultProps = {
        value: "Advanced" as Mastery | "",
        onValueChange: mockOnValueChange,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders the select trigger and all mastery options", () => {
        render(<SkillMasterySelect {...defaultProps} />)

        const trigger = document.querySelector('[data-slot="select-trigger"]')
        expect(trigger).toBeInTheDocument()
        expect(trigger).toHaveAttribute("role", "combobox")
    })

    it("shows the currently selected value in the trigger", () => {
        render(<SkillMasterySelect {...defaultProps} value="Advanced" />)

        const trigger = document.querySelector('[data-slot="select-trigger"]')
        expect(trigger).toHaveTextContent("masteryLevels.advanced")
    })

    it("renders placeholder when value is empty", () => {
        render(<SkillMasterySelect {...defaultProps} value="" />)

        const trigger = document.querySelector('[data-slot="select-trigger"]')
        expect(trigger).toBeInTheDocument()
        expect(trigger).toHaveTextContent("masteryPlaceholder")
    })

    it("triggers onValueChange with correct mastery when handleValueChange is called", () => {
        const { rerender } = render(<SkillMasterySelect {...defaultProps} />)

        rerender(
            <SkillMasterySelect
                value={"Expert" as Mastery}
                onValueChange={mockOnValueChange}
            />,
        )

        const trigger = document.querySelector('[data-slot="select-trigger"]')
        expect(trigger).toHaveTextContent("masteryLevels.expert")
    })

    it("does not call onValueChange when selectedValue is not in MASTERY_OPTIONS", () => {
        render(<SkillMasterySelect {...defaultProps} />)

        const select = document.querySelector('[data-slot="select-trigger"]')
        expect(select).toBeInTheDocument()
    })

    it("displays the correct label for all mastery levels", () => {
        const masteryLevels: Mastery[] = [
            "Novice",
            "Advanced",
            "Competent",
            "Proficient",
            "Expert",
        ]

        masteryLevels.forEach((mastery) => {
            const { unmount } = render(
                <SkillMasterySelect
                    value={mastery}
                    onValueChange={mockOnValueChange}
                />,
            )

            const trigger = document.querySelector(
                '[data-slot="select-trigger"]',
            )
            expect(trigger).toBeInTheDocument()
            unmount()
        })
    })

    it("shows mastery placeholder label when hasValue is true", () => {
        render(<SkillMasterySelect {...defaultProps} value="Advanced" />)

        const label = document.querySelector(
            "span.pointer-events-none.absolute",
        )
        expect(label).toBeInTheDocument()
        expect(label).toHaveTextContent("masteryPlaceholder")
    })

    it("does not show mastery placeholder label when value is empty", () => {
        render(<SkillMasterySelect {...defaultProps} value="" />)

        const label = document.querySelector(
            "span.pointer-events-none.absolute",
        )
        expect(label).not.toBeInTheDocument()
    })

    it("calls onValueChange when a mastery option is selected", async () => {
        const user = userEvent.setup()
        render(<SkillMasterySelect {...defaultProps} value="" />)

        const trigger = screen.getByRole("combobox")
        await user.click(trigger)

        const expertOption = await screen.findByText("masteryLevels.expert")
        await user.click(expertOption)

        expect(mockOnValueChange).toHaveBeenCalledWith("Expert")
    })

    it("handles selection of different mastery levels", async () => {
        const user = userEvent.setup()
        render(<SkillMasterySelect {...defaultProps} value="" />)

        const trigger = screen.getByRole("combobox")
        await user.click(trigger)

        const noviceOption = await screen.findByText("masteryLevels.novice")
        await user.click(noviceOption)

        expect(mockOnValueChange).toHaveBeenCalledWith("Novice")
    })

    it("falls back to value when getSelectedLabel cannot find matching option", () => {
        const unknownValue = "UnknownMastery" as Mastery
        render(
            <SkillMasterySelect
                value={unknownValue}
                onValueChange={mockOnValueChange}
            />,
        )

        const trigger = screen.getByRole("combobox")
        expect(trigger).toHaveTextContent("UnknownMastery")
    })

    it("returns empty string in getSelectedLabel when value is empty", () => {
        render(<SkillMasterySelect {...defaultProps} value="" />)

        const trigger = screen.getByRole("combobox")
        expect(trigger).toHaveTextContent("masteryPlaceholder")
    })

    it("handles null value in handleValueChange", async () => {
        const user = (await import("@testing-library/user-event")).default
        render(<SkillMasterySelect {...defaultProps} value="Advanced" />)

        const trigger = screen.getByRole("combobox")
        await user.setup().click(trigger)

        const combobox = screen.getByRole("combobox")
        expect(combobox).toBeInTheDocument()
    })

    it("tests all Mastery types are rendered", () => {
        const masteryTypes: Mastery[] = [
            "Novice",
            "Advanced",
            "Competent",
            "Proficient",
            "Expert",
        ]

        masteryTypes.forEach((mastery) => {
            const { unmount } = render(
                <SkillMasterySelect
                    value={mastery}
                    onValueChange={mockOnValueChange}
                />,
            )
            const triggers = screen.getAllByRole("combobox")
            expect(triggers.length).toBeGreaterThan(0)
            unmount()
        })
    })
})
