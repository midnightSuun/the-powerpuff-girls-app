import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useEditLanguageModal } from "../hooks/use-edit-language-modal"

describe("useEditLanguageModal", () => {
    const mockOnSave = vi.fn()
    const mockOnClose = vi.fn()
    const initialProficiency = "B2" as const

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with currentProficiency correctly", () => {
        const { result } = renderHook(() =>
            useEditLanguageModal({
                currentProficiency: initialProficiency,
                onSave: mockOnSave,
                onClose: mockOnClose,
            }),
        )

        expect(result.current.proficiency).toBe("B2")
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("allows updating proficiency state", () => {
        const { result } = renderHook(() =>
            useEditLanguageModal({
                currentProficiency: initialProficiency,
                onSave: mockOnSave,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setProficiency("Native")
        })

        expect(result.current.proficiency).toBe("Native")
    })

    it("submits successfully, calls onSave, and closes modal", async () => {
        mockOnSave.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useEditLanguageModal({
                currentProficiency: initialProficiency,
                onSave: mockOnSave,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setProficiency("C1")
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnSave).toHaveBeenCalledWith("C1")
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("handles submission error when thrown error is an instance of Error", async () => {
        const customError = new Error("Failed to save proficiency")
        mockOnSave.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useEditLanguageModal({
                currentProficiency: initialProficiency,
                onSave: mockOnSave,
                onClose: mockOnClose,
            }),
        )

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("Failed to save proficiency")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("falls back to translation key if rejection is not an Error instance", async () => {
        mockOnSave.mockRejectedValueOnce("Unknown error string")

        const { result } = renderHook(() =>
            useEditLanguageModal({
                currentProficiency: initialProficiency,
                onSave: mockOnSave,
                onClose: mockOnClose,
            }),
        )

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("errors.failed")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })
})
