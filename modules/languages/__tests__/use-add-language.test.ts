import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAddLanguageModal } from "../hooks/use-add-language-modal"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

describe("useAddLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnAdd = vi.fn()
    const availableLanguages = [
        { id: "1", name: "English" },
        { id: "2", name: "Spanish" },
        { id: "3", name: "German" },
    ]
    const existingLanguages = [{ name: "English" }]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with default values and filters available options correctly", () => {
        const { result } = renderHook(() =>
            useAddLanguageModal({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        expect(result.current.selectedLanguageId).toBe("")
        expect(result.current.proficiency).toBe("")
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)

        expect(result.current.availableOptions).toEqual([
            { id: "2", name: "Spanish" },
            { id: "3", name: "German" },
        ])
    })

    it("resets state and calls onClose when handleClose is invoked", () => {
        const { result } = renderHook(() =>
            useAddLanguageModal({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("2")
            result.current.setProficiency("ADVANCED" as never)
        })

        expect(result.current.selectedLanguageId).toBe("2")
        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.handleClose()
        })

        expect(result.current.selectedLanguageId).toBe("")
        expect(result.current.proficiency).toBe("")
        expect(result.current.error).toBeNull()
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it("does nothing on submit if selected language or proficiency is missing", async () => {
        const { result } = renderHook(() =>
            useAddLanguageModal({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnAdd).not.toHaveBeenCalled()
    })

    it("submits successfully when valid language and proficiency are provided", async () => {
        mockOnAdd.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useAddLanguageModal({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("3")
            result.current.setProficiency("NATIVE" as never)
        })

        expect(result.current.isValid).toBe(true)

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(mockOnAdd).toHaveBeenCalledWith("German", "NATIVE")
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles Error instance during submission and sets error message", async () => {
        const backendError = new Error("Network error")
        mockOnAdd.mockRejectedValueOnce(backendError)

        const { result } = renderHook(() =>
            useAddLanguageModal({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("3")
            result.current.setProficiency("INTERMEDIATE" as never)
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("Network error")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("handles non-Error rejection during submission and falls back to translation key", async () => {
        mockOnAdd.mockRejectedValueOnce("Some string error")

        const { result } = renderHook(() =>
            useAddLanguageModal({
                onAdd: mockOnAdd,
                availableLanguages,
                existingLanguages,
                onClose: mockOnClose,
            }),
        )

        act(() => {
            result.current.setSelectedLanguageId("3")
            result.current.setProficiency("INTERMEDIATE" as never)
        })

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
