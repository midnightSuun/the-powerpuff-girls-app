import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useLanguageProficiencySelect } from "../hooks/use-language-proficiency-select"

describe("useLanguageProficiencySelect", () => {
    const mockOnValueChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("returns all proficiency levels correctly", () => {
        const { result } = renderHook(() =>
            useLanguageProficiencySelect({ onValueChange: mockOnValueChange }),
        )

        expect(result.current.proficiencyLevels).toEqual([
            "A1",
            "A2",
            "B1",
            "B2",
            "C1",
            "C2",
            "Native",
        ])
    })

    it("calls onValueChange when a valid proficiency is selected", () => {
        const { result } = renderHook(() =>
            useLanguageProficiencySelect({ onValueChange: mockOnValueChange }),
        )

        act(() => {
            result.current.handleValueChange("C1")
        })

        expect(mockOnValueChange).toHaveBeenCalledTimes(1)
        expect(mockOnValueChange).toHaveBeenCalledWith("C1")
    })

    it("does not call onValueChange when an invalid or null value is passed", () => {
        const { result } = renderHook(() =>
            useLanguageProficiencySelect({ onValueChange: mockOnValueChange }),
        )

        act(() => {
            result.current.handleValueChange("INVALID_LEVEL")
            result.current.handleValueChange(null)
        })

        expect(mockOnValueChange).not.toHaveBeenCalled()
    })
})
