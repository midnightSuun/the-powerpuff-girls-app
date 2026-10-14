import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { AdminLanguageItem } from "../hooks/use-edit-language-admin-modal"
import { useEditLanguageAdminModal } from "../hooks/use-edit-language-admin-modal"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

describe("useEditLanguageAdminModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const sampleLanguage: AdminLanguageItem = {
        id: "lang-1",
        name: "English",
        iso2: "en",
        nativeName: "English",
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes with default empty values when language is null", () => {
        const { result } = renderHook(() =>
            useEditLanguageAdminModal({
                language: null,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.iso2).toBe("")
        expect(result.current.nativeName).toBe("")
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
    })

    it("populates fields when language is provided or changes", () => {
        const { result, rerender } = renderHook(
            ({ lang }) =>
                useEditLanguageAdminModal({
                    language: lang,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            { initialProps: { lang: null as AdminLanguageItem | null } },
        )

        expect(result.current.name).toBe("")

        rerender({ lang: sampleLanguage })

        expect(result.current.name).toBe("English")
        expect(result.current.iso2).toBe("en")
        expect(result.current.nativeName).toBe("English")
        expect(result.current.isValid).toBe(true)
    })

    it("validates iso2 length constraints (2 to 5 characters)", () => {
        const { result } = renderHook(() =>
            useEditLanguageAdminModal({
                language: sampleLanguage,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.setIso2("e")
        })
        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setIso2("engli")
        })
        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.setIso2("english")
        })
        expect(result.current.isValid).toBe(false)
    })

    it("submits form successfully, trims inputs, and closes modal", async () => {
        mockOnUpdate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useEditLanguageAdminModal({
                language: sampleLanguage,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        act(() => {
            result.current.setName("  British English  ")
            result.current.setIso2("  eng  ")
            result.current.setNativeName("  UK English  ")
        })

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(fakeEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnUpdate).toHaveBeenCalledWith("lang-1", {
            name: "British English",
            iso2: "ENG",
            nativeName: "UK English",
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles update error correctly", async () => {
        const customError = new Error("Update failed on server")
        mockOnUpdate.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useEditLanguageAdminModal({
                language: sampleLanguage,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("Update failed on server")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("falls back to default error translation key if error is not an Error instance", async () => {
        mockOnUpdate.mockRejectedValueOnce("Unknown error string")

        const { result } = renderHook(() =>
            useEditLanguageAdminModal({
                language: sampleLanguage,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        const fakeEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(fakeEvent)
        })

        expect(result.current.error).toBe("errors.updateFailed")
    })
})
