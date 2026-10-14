import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"

import { SkillMasterySelect } from "../ui/components/user/skill-mastery-select"

vi.mock("@/components/ui/select", () => ({
    Select: ({
        value,
        onValueChange,
        children,
    }: {
        value: string
        onValueChange: (val: string) => void
        children: React.ReactNode
    }) => (
        <div data-testid="select-root" data-value={value}>
            {children}
            <button
                data-testid="simulate-change-expert"
                onClick={() => onValueChange("Expert")}
            >
                Select Expert
            </button>
        </div>
    ),
    SelectTrigger: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <button data-testid="select-trigger" className={className}>
            {children}
        </button>
    ),
    SelectValue: ({ placeholder }: { placeholder: string }) => (
        <span data-testid="select-value">{placeholder}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
        value,
        children,
        className,
    }: {
        value: string
        children: React.ReactNode
        className?: string
    }) => (
        <div
            data-testid={`select-item-${value}`}
            data-selected-class={className}
        >
            {children}
        </div>
    ),
}))

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
        vi.restoreAllMocks()
    })

    it("renders the select trigger and all mastery options", () => {
        render(<SkillMasterySelect {...defaultProps} />)

        expect(screen.getAllByTestId("select-trigger")[0]).toBeInTheDocument()
        expect(screen.getAllByTestId("select-content")[0]).toBeInTheDocument()

        expect(screen.getByTestId("select-item-Novice")).toBeInTheDocument()
        expect(screen.getByTestId("select-item-Advanced")).toBeInTheDocument()
        expect(screen.getByTestId("select-item-Competent")).toBeInTheDocument()
        expect(screen.getByTestId("select-item-Proficient")).toBeInTheDocument()
        expect(screen.getByTestId("select-item-Expert")).toBeInTheDocument()
    })

    it("triggers onValueChange with correct mastery option when selection changes", () => {
        render(<SkillMasterySelect {...defaultProps} />)

        fireEvent.click(screen.getAllByTestId("simulate-change-expert")[0])
        expect(mockOnValueChange).toHaveBeenCalledWith("Expert")
    })

    it("renders placeholder when value is empty", () => {
        render(<SkillMasterySelect {...defaultProps} value="" />)

        const valueSpan = screen.getAllByTestId("select-value")[0]
        expect(valueSpan).toHaveTextContent("masteryPlaceholder")
    })
})
