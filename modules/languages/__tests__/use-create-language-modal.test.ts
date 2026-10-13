import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateLanguageAdminModal } from "../hooks/use-create-language-admin-modal"

vi.mock("@/lib/validate-unique-name", () => ({
    normalizeName: vi.fn((val: string) => val.trim()),
    isNameDuplicate: vi.fn((name: string, list: string[]) =>
        list.includes(name.trim()),
    ),
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

describe("useCreateLanguageAdminModal", () => {
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()
    const existingLanguageNames = ["English", "Spanish"]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with default empty values and correct derived states", () => {
        const { result } = renderHook(() =>
            useCreateLanguageAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingLanguageNames,
                onCreate: mockOnCreate,
            }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.iso2).toBe("")
        expect(result.current.nativeName).toBe("")
        expect(result.current.inlineError).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
    })

    it("resets form fields when isOpen changes to false", () => {
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useCreateLanguageAdminModal({
                    isOpen,
                    onClose: mockOnClose,
                    existingLanguageNames,
                    onCreate: mockOnCreate,
                }),
            { initialProps: { isOpen: true } },
        )

        act(() => {
            result.current.setName("French")
            result.current.setIso2("fr")
            result.current.setNativeName("Français")
        })

        expect(result.current.name).toBe("French")

        rerender({ isOpen: false })

        expect(result.current.name).toBe("")
        expect(result.current.iso2).toBe("")
        expect(result.current.nativeName).toBe("")
        expect(result.current.error).toBeNull()
    })

    it("validates form correctness via isValid and handles duplicates", () => {
        const { result } = renderHook(() =>
            useCreateLanguageAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingLanguageNames,
                onCreate: mockOnCreate,
            }),
        )

        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setName("German")
            result.current.setIso2("de")
        })
        expect(result.current.isValid).toBe(true)
        expect(result.current.inlineError).toBeNull()

        act(() => {
            result.current.setName("English")
        })
        expect(result.current.isValid).toBe(false)
        expect(result.current.inlineError).toBe("errors.duplicate")
    })

    it("submits form successfully, trims values, and closes modal", async () => {
        mockOnCreate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useCreateLanguageAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingLanguageNames,
                onCreate: mockOnCreate,
            }),
        )

        act(() => {
            result.current.setName("  German  ")
            result.current.setIso2("  de  ")
            result.current.setNativeName("  Deutsch  ")
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnCreate).toHaveBeenCalledWith({
            name: "German",
            iso2: "DE",
            nativeName: "Deutsch",
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles creation error and sets error state", async () => {
        const customError = new Error("Creation failed in backend")
        mockOnCreate.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useCreateLanguageAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingLanguageNames,
                onCreate: mockOnCreate,
            }),
        )

        act(() => {
            result.current.setName("German")
            result.current.setIso2("de")
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("Creation failed in backend")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })
})
