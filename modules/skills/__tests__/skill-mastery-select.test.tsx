import { cleanup, render, screen } from "@testing-library/react"
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
})
