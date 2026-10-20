import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
import {
    createAdminLanguage,
    deleteAdminLanguage,
    updateAdminLanguage,
} from "@/modules/languages/api/admin-languages"

import { useAdminLanguagesView } from "../hooks/use-admin-languages-view"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/hooks/use-admin-crud-state", () => ({
    useAdminCrudState: vi.fn(),
}))

vi.mock("@/modules/languages/api/admin-languages", () => ({
    createAdminLanguage: vi.fn(),
    updateAdminLanguage: vi.fn(),
    deleteAdminLanguage: vi.fn(),
}))

describe("useAdminLanguagesView", () => {
    const mockSuccess = vi.fn()
    const mockAddItem = vi.fn()
    const mockUpdateItem = vi.fn()
    const mockRemoveItem = vi.fn()
    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingItem = vi.fn()
    const mockSetDeletingItem = vi.fn()

    const mockInitialLanguages = [{ id: "lang-1", name: "English", iso2: "en" }]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccess,
            error: vi.fn(),
        } as unknown as ReturnType<typeof useActionNotifications>)

        vi.mocked(useAdminCrudState).mockReturnValue({
            items: mockInitialLanguages,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingItem: null,
            setEditingItem: mockSetEditingItem,
            deletingItem: null,
            setDeletingItem: mockSetDeletingItem,
            addItem: mockAddItem,
            updateItem: mockUpdateItem,
            removeItem: mockRemoveItem,
        } as unknown as ReturnType<typeof useAdminCrudState>)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("initializes and maps states/handlers correctly", () => {
        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        expect(result.current.languages).toEqual(mockInitialLanguages)
        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingLanguage).toBeNull()
        expect(result.current.deletingLanguage).toBeNull()
    })

    it("handles creation successfully", async () => {
        const newLangInput = { name: "Spanish", iso2: "es" }
        const createdResponse = { id: "lang-2", ...newLangInput }
        vi.mocked(createAdminLanguage).mockResolvedValueOnce(createdResponse)

        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        await act(async () => {
            await result.current.handleCreate(newLangInput)
        })

        expect(createAdminLanguage).toHaveBeenCalledWith(newLangInput)
        expect(mockSuccess).toHaveBeenCalledWith("created")
        expect(mockAddItem).toHaveBeenCalledWith({
            id: "lang-2",
            name: "Spanish",
            iso2: "es",
        })
    })

    it("handles creation when created result is falsy", async () => {
        const newLangInput = { name: "Spanish", iso2: "es" }
        vi.mocked(createAdminLanguage).mockResolvedValueOnce(null as never)

        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        await act(async () => {
            await result.current.handleCreate(newLangInput)
        })

        expect(createAdminLanguage).toHaveBeenCalledWith(newLangInput)
        expect(mockSuccess).toHaveBeenCalledWith("created")
        expect(mockAddItem).not.toHaveBeenCalled()
    })

    it("handles update successfully", async () => {
        const updateInput = { name: "Updated English", iso2: "en" }
        const updatedResponse = { id: "lang-1", ...updateInput }
        vi.mocked(updateAdminLanguage).mockResolvedValueOnce(updatedResponse)

        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        await act(async () => {
            await result.current.handleUpdate("lang-1", updateInput)
        })

        expect(updateAdminLanguage).toHaveBeenCalledWith({
            id: "lang-1",
            name: "Updated English",
            iso2: "en",
        })
        expect(mockSuccess).toHaveBeenCalledWith("updated")
        expect(mockUpdateItem).toHaveBeenCalledWith("lang-1", {
            name: "Updated English",
            iso2: "en",
        })
    })

    it("handles update when updated result is falsy", async () => {
        const updateInput = { name: "Updated English", iso2: "en" }
        vi.mocked(updateAdminLanguage).mockResolvedValueOnce(null as never)

        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        await act(async () => {
            await result.current.handleUpdate("lang-1", updateInput)
        })

        expect(updateAdminLanguage).toHaveBeenCalledWith({
            id: "lang-1",
            name: "Updated English",
            iso2: "en",
        })
        expect(mockSuccess).toHaveBeenCalledWith("updated")
        expect(mockUpdateItem).not.toHaveBeenCalled()
    })

    it("handles delete confirmation successfully when deletingItem is present", async () => {
        vi.mocked(useAdminCrudState).mockReturnValue({
            items: mockInitialLanguages,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingItem: null,
            setEditingItem: mockSetEditingItem,
            deletingItem: { id: "lang-1", name: "English", iso2: "en" },
            setDeletingItem: mockSetDeletingItem,
            addItem: mockAddItem,
            updateItem: mockUpdateItem,
            removeItem: mockRemoveItem,
        } as unknown as ReturnType<typeof useAdminCrudState>)

        vi.mocked(deleteAdminLanguage).mockResolvedValueOnce({
            success: true,
        } as never)

        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteAdminLanguage).toHaveBeenCalledWith({
            languageId: "lang-1",
        })
        expect(mockSuccess).toHaveBeenCalledWith("deleted")
        expect(mockRemoveItem).toHaveBeenCalledWith("lang-1")
    })

    it("does nothing on delete confirm if deletingItem is null", async () => {
        const { result } = renderHook(() =>
            useAdminLanguagesView({ initialLanguages: mockInitialLanguages }),
        )

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteAdminLanguage).not.toHaveBeenCalled()
        expect(mockSuccess).not.toHaveBeenCalled()
    })
})
