import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useUserSelectionState } from "@/hooks/use-user-selection-state"

import {
    addProfileLanguage,
    deleteProfileLanguages,
    updateProfileLanguage,
} from "../api/languages"
import { useLanguagesPage } from "../hooks/use-languages-page"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/hooks/use-user-selection-state", () => ({
    useUserSelectionState: vi.fn(),
}))

vi.mock("../api/languages", () => ({
    addProfileLanguage: vi.fn(),
    updateProfileLanguage: vi.fn(),
    deleteProfileLanguages: vi.fn(),
}))

describe("useLanguagesPage", () => {
    const mockRefresh = vi.fn()
    const mockSuccess = vi.fn()
    const mockToggleSelection = vi.fn()
    const mockResetSelection = vi.fn()
    const mockSetIsSelectionMode = vi.fn()
    const mockSetSelectedItems = vi.fn()

    const initialUserLanguages = [
        { name: "English", proficiency: "Native" as const },
        { name: "Spanish", proficiency: "B2" as const },
    ]

    const userId = "user-123"

    let selectionMode = false
    let selectedItems: string[] = []

    beforeEach(() => {
        vi.clearAllMocks()
        selectionMode = false
        selectedItems = []

        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRefresh,
        } as unknown as ReturnType<typeof useRouter>)

        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccess,
            error: vi.fn(),
        } as unknown as ReturnType<typeof useActionNotifications>)

        vi.mocked(useUserSelectionState).mockImplementation(() => ({
            isSelectionMode: selectionMode,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedItems,
            setSelectedItems: mockSetSelectedItems,
            toggleSelection: mockToggleSelection,
            clearSelection: vi.fn(),
            resetSelection: mockResetSelection,
        }))
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes states correctly", () => {
        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        expect(result.current.isRemovalMode).toBe(false)
        expect(result.current.selectedLanguages).toEqual([])
        expect(result.current.isAddOpen).toBe(false)
        expect(result.current.editingLang).toBeNull()
        expect(result.current.isRemoveConfirmOpen).toBe(false)
    })

    it("toggles select language in normal mode to set editingLang", () => {
        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        act(() => {
            result.current.toggleSelectLanguage("Spanish")
        })

        expect(result.current.editingLang).toEqual({
            name: "Spanish",
            proficiency: "B2",
        })
    })

    it("toggles select language in selection mode to call selection.toggleSelection", () => {
        selectionMode = true
        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        act(() => {
            result.current.toggleSelectLanguage("Spanish")
        })

        expect(mockToggleSelection).toHaveBeenCalledWith("Spanish")
        expect(result.current.editingLang).toBeNull()
    })

    it("handles adding profile language successfully", async () => {
        vi.mocked(addProfileLanguage).mockResolvedValueOnce({} as never)

        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        await act(async () => {
            await result.current.handleAdd("French", "A1")
        })

        expect(addProfileLanguage).toHaveBeenCalledWith({
            userId,
            name: "French",
            proficiency: "A1",
        })
        expect(mockSuccess).toHaveBeenCalledWith("created")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it("handles updating profile language successfully when editingLang is present", async () => {
        vi.mocked(updateProfileLanguage).mockResolvedValueOnce({} as never)

        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        act(() => {
            result.current.toggleSelectLanguage("Spanish")
        })

        expect(result.current.editingLang).not.toBeNull()

        await act(async () => {
            await result.current.handleUpdate("C1")
        })

        expect(updateProfileLanguage).toHaveBeenCalledWith({
            userId,
            name: "Spanish",
            proficiency: "C1",
        })
        expect(mockSuccess).toHaveBeenCalledWith("updated")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it("does nothing on handleUpdate if editingLang is null", async () => {
        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        await act(async () => {
            await result.current.handleUpdate("C1")
        })

        expect(updateProfileLanguage).not.toHaveBeenCalled()
        expect(mockSuccess).not.toHaveBeenCalled()
    })

    it("handles deleting profile languages successfully", async () => {
        selectionMode = true
        selectedItems = ["English", "Spanish"]
        vi.mocked(deleteProfileLanguages).mockResolvedValueOnce({} as never)

        const { result } = renderHook(() =>
            useLanguagesPage({ userId, initialUserLanguages }),
        )

        await act(async () => {
            await result.current.handleDelete()
        })

        expect(deleteProfileLanguages).toHaveBeenCalledWith({
            userId,
            name: ["English", "Spanish"],
        })
        expect(mockSuccess).toHaveBeenCalledWith("deleted")
        expect(mockResetSelection).toHaveBeenCalledTimes(1)
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
})
