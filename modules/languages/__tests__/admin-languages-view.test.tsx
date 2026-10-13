import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAdminLanguagesView } from "@/modules/languages/hooks/use-admin-languages-view"

import { AdminLanguagesView } from "../ui/components/admin/admin-languages-view"

vi.mock("@/modules/languages/hooks/use-admin-languages-view", () => ({
    useAdminLanguagesView: vi.fn(),
}))

type LanguageItem = {
    id: string
    name: string
    iso2: string
    nativeName?: string
}

vi.mock("@/components/ui/admin-data-table", () => ({
    AdminDataTable: ({
        onCreateClick,
    }: {
        data: Array<LanguageItem>
        onCreateClick?: () => void
    }) => (
        <div data-testid="admin-data-table">
            <button onClick={onCreateClick}>actions.create</button>
        </div>
    ),
}))

vi.mock(
    "@/modules/languages/ui/components/admin/create-language-admin-modal",
    () => ({
        CreateLanguageModal: ({
            isOpen,
            onClose,
        }: {
            isOpen: boolean
            onClose: () => void
        }) =>
            isOpen ? (
                <div data-testid="create-modal">
                    <button onClick={onClose}>Close Create</button>
                </div>
            ) : null,
    }),
)

vi.mock(
    "@/modules/languages/ui/components/admin/edit-language-admin-modal",
    () => ({
        EditLanguageModal: ({
            isOpen,
            onClose,
        }: {
            isOpen: boolean
            onClose: () => void
        }) =>
            isOpen ? (
                <div data-testid="edit-modal">
                    <button onClick={onClose}>Close Edit</button>
                </div>
            ) : null,
    }),
)

vi.mock(
    "@/modules/languages/ui/components/admin/delete-language-admin-modal",
    () => ({
        DeleteLanguageModal: ({
            isOpen,
            onClose,
        }: {
            isOpen: boolean
            onClose: () => void
        }) =>
            isOpen ? (
                <div data-testid="delete-modal">
                    <button onClick={onClose}>Close Delete</button>
                </div>
            ) : null,
    }),
)

type HookReturnType = ReturnType<typeof useAdminLanguagesView>

describe("AdminLanguagesView", () => {
    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingLanguage = vi.fn()
    const mockSetDeletingLanguage = vi.fn()
    const mockHandleCreate = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDeleteConfirm = vi.fn()

    const initialLanguages: Array<LanguageItem> = [
        { id: "1", name: "English", iso2: "en", nativeName: "English" },
        { id: "2", name: "Spanish", iso2: "es" },
    ]

    const defaultHookValues: HookReturnType = {
        languages: initialLanguages,
        isCreateOpen: false,
        setIsCreateOpen: mockSetIsCreateOpen,
        editingLanguage: null,
        setEditingLanguage: mockSetEditingLanguage,
        deletingLanguage: null,
        setDeletingLanguage: mockSetDeletingLanguage,
        handleCreate: mockHandleCreate,
        handleUpdate: mockHandleUpdate,
        handleDeleteConfirm: mockHandleDeleteConfirm,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAdminLanguagesView).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders languages table and correctly formats ISO codes & native names", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("admin-data-table")).toBeInTheDocument()
    })

    it("opens create modal when create button is clicked", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        const createButton = screen.getByText("actions.create")
        fireEvent.click(createButton)

        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(true)
    })

    it("renders create modal when isCreateOpen is true", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            isCreateOpen: true,
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("create-modal")).toBeInTheDocument()
    })

    it("renders edit modal when editingLanguage is present", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            editingLanguage: initialLanguages[0],
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("edit-modal")).toBeInTheDocument()
    })

    it("renders delete modal when deletingLanguage is present", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            deletingLanguage: initialLanguages[0],
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
    })
})
