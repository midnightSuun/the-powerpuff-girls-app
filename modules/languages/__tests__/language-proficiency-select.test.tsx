import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useLanguageProficiencySelect } from "@/modules/languages/hooks/use-language-proficiency-select"

import { LanguageProficiencySelect } from "../ui/components/user/language-proficiency-select"

vi.mock("@/modules/languages/hooks/use-language-proficiency-select", () => ({
    useLanguageProficiencySelect: vi.fn(),
}))

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
                onClick={() => onValueChange("B1")}
                data-testid="select-option-b1"
            >
                B1
            </button>
        </div>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-trigger">{children}</div>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
        value,
        children,
    }: {
        value: string
        children: React.ReactNode
    }) => (
        <div data-testid={`select-item-${value}`} data-value={value}>
            {children}
        </div>
    ),
}))

describe("LanguageProficiencySelect", () => {
    const mockOnValueChange = vi.fn()
    const mockHandleValueChange = vi.fn()

    const defaultHookValues = {
        proficiencyLevels: [
            "A1",
            "A2",
            "B1",
            "B2",
            "C1",
            "C2",
            "Native",
        ] as const,
        handleValueChange: mockHandleValueChange,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useLanguageProficiencySelect).mockReturnValue(
            defaultHookValues,
        )
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders select with placeholder and proficiency options correctly", () => {
        render(
            <LanguageProficiencySelect
                value=""
                onValueChange={mockOnValueChange}
            />,
        )

        expect(screen.getAllByTestId("select-root")[0]).toBeInTheDocument()
        expect(screen.getAllByTestId("select-trigger")[0]).toBeInTheDocument()
        expect(screen.getAllByTestId("select-trigger")[0]).toHaveTextContent(
            "proficiencyPlaceholder",
        )

        expect(screen.getByTestId("select-item-A1")).toBeInTheDocument()
        expect(screen.getByTestId("select-item-B1")).toBeInTheDocument()
        expect(screen.getByTestId("select-item-Native")).toBeInTheDocument()
    })

    it("triggers handleValueChange when a new proficiency level is selected", () => {
        const { container } = render(
            <LanguageProficiencySelect
                value="A1"
                onValueChange={mockOnValueChange}
            />,
        )

        const optionButton = container.querySelector(
            '[data-testid="select-option-b1"]',
        ) as HTMLButtonElement
        fireEvent.click(optionButton)

        expect(mockHandleValueChange).toHaveBeenCalledWith("B1")
    })
})
