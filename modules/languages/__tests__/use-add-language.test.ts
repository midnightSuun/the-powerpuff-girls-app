import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAddLanguage } from "../hooks/use-add-language"

describe("useAddLanguage", () => {
    const mockOnAdd = vi.fn()
    const mockOnClose = vi.fn()

    const availableLanguages = [
        { id: "lang-1", name: "English" },
        { id: "lang-2", name: "Spanish" },
        { id: "lang-3", name: "French" },
    ]

    const existingLanguages = [{ name: "English" }]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("filters out existing languages correctly", () => {
        const { result } = renderHook(() =>
            useAddLanguage({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        expect(result.current.availableOptions).toEqual([
            { id: "lang-2", name: "Spanish" },
            { id: "lang-3", name: "French" },
        ])
    })

    it("validates form correctness via isValid", () => {
        const { result } = renderHook(() =>
            useAddLanguage({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setSelectedLanguageId("lang-2")
        })
        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setProficiency("C1")
        })
        expect(result.current.isValid).toBe(true)
    })

    it("submits form successfully and resets state", async () => {
        mockOnAdd.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useAddLanguage({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("lang-2")
            result.current.setProficiency("Native")
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnAdd).toHaveBeenCalledWith("Spanish", "Native")
        expect(result.current.selectedLanguageId).toBe("")
        expect(result.current.proficiency).toBe("")
        expect(result.current.error).toBeNull()
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it("handles submission error correctly", async () => {
        const customError = new Error("Failed to add language")
        mockOnAdd.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useAddLanguage({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("lang-2")
            result.current.setProficiency("C1")
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("Failed to add language")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("resets state when handleClose is invoked", () => {
        const { result } = renderHook(() =>
            useAddLanguage({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("lang-2")
            result.current.setProficiency("A1")
        })

        act(() => {
            result.current.handleClose()
        })

        expect(result.current.selectedLanguageId).toBe("")
        expect(result.current.proficiency).toBe("")
        expect(result.current.error).toBeNull()
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
})
