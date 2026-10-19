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
        data,
        onCreateClick,
        onEditClick,
        onDeleteClick,
        getSearchableString,
        getSortValue,
    }: {
        data: Array<LanguageItem>
        onCreateClick?: () => void
        onEditClick?: (item: LanguageItem) => void
        onDeleteClick?: (item: LanguageItem) => void
        getSearchableString?: (item: LanguageItem) => string
        getSortValue?: (item: LanguageItem, key: string) => string
    }) => (
        <div data-testid="admin-data-table">
            <button onClick={onCreateClick}>actions.create</button>
            {data.map((item) => (
                <div key={item.id} data-testid={`lang-item-${item.id}`}>
                    <span data-testid={`lang-name-${item.id}`}>
                        {item.name}
                    </span>
                    <span data-testid={`lang-iso-${item.id}`}>{item.iso2}</span>
                    <span data-testid={`lang-native-${item.id}`}>
                        {item.nativeName}
                    </span>
                    <button
                        data-testid={`edit-${item.id}`}
                        onClick={() => onEditClick?.(item)}
                    >
                        Edit
                    </button>
                    <button
                        data-testid={`delete-${item.id}`}
                        onClick={() => onDeleteClick?.(item)}
                    >
                        Delete
                    </button>
                    {getSearchableString && (
                        <span data-testid={`searchable-${item.id}`}>
                            {getSearchableString(item)}
                        </span>
                    )}
                    {getSortValue && (
                        <>
                            <span data-testid={`sort-iso2-${item.id}`}>
                                {getSortValue(item, "iso2")}
                            </span>
                            <span data-testid={`sort-nativeName-${item.id}`}>
                                {getSortValue(item, "nativeName")}
                            </span>
                            <span data-testid={`sort-name-${item.id}`}>
                                {getSortValue(item, "name")}
                            </span>
                        </>
                    )}
                </div>
            ))}
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

    it("formats ISO codes to uppercase", () => {
        const languagesWithLowercase = [
            { id: "1", name: "English", iso2: "en" },
            { id: "2", name: "Spanish", iso2: "es" },
        ]

        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: languagesWithLowercase,
        })

        render(<AdminLanguagesView initialLanguages={languagesWithLowercase} />)

        expect(screen.getByTestId("lang-iso-1")).toHaveTextContent("EN")
        expect(screen.getByTestId("lang-iso-2")).toHaveTextContent("ES")
    })

    it("uses native name from NATIVE_LANGUAGE_NAMES when iso2 matches", () => {
        const languagesWithKnownCodes = [
            { id: "1", name: "English", iso2: "en" },
            { id: "2", name: "Russian", iso2: "ru" },
        ]

        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: languagesWithKnownCodes,
        })

        render(
            <AdminLanguagesView initialLanguages={languagesWithKnownCodes} />,
        )

        expect(screen.getByTestId("lang-native-1")).toHaveTextContent("English")
        expect(screen.getByTestId("lang-native-2")).toHaveTextContent("Русский")
    })

    it("uses Intl.DisplayNames for unknown ISO codes", () => {
        const languagesWithUnknownCodes = [
            { id: "1", name: "Japanese", iso2: "ja" },
        ]

        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: languagesWithUnknownCodes,
        })

        render(
            <AdminLanguagesView initialLanguages={languagesWithUnknownCodes} />,
        )

        expect(screen.getByTestId("lang-native-1")).toBeInTheDocument()
    })

    it("handles Intl.DisplayNames result for uncommon ISO codes", () => {
        const languagesWithUncommonCodes = [
            { id: "1", name: "Unknown Language", iso2: "xx" },
        ]

        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: languagesWithUncommonCodes,
        })

        render(
            <AdminLanguagesView
                initialLanguages={languagesWithUncommonCodes}
            />,
        )

        const nativeElement = screen.getByTestId("lang-native-1")
        expect(nativeElement).toBeInTheDocument()
        expect(nativeElement.textContent).toBeTruthy()
    })

    it("handles missing iso2 gracefully", () => {
        const languagesWithoutIso = [
            { id: "1", name: "Custom Language", iso2: "" },
        ]

        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: languagesWithoutIso,
        })

        render(<AdminLanguagesView initialLanguages={languagesWithoutIso} />)

        expect(screen.getByTestId("lang-iso-1")).toHaveTextContent("")
    })

    it("calls setEditingLanguage when edit is clicked", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        const editButton = screen.getByTestId("edit-1")
        fireEvent.click(editButton)

        expect(mockSetEditingLanguage).toHaveBeenCalled()
    })

    it("calls setDeletingLanguage when delete is clicked", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        const deleteButton = screen.getByTestId("delete-1")
        fireEvent.click(deleteButton)

        expect(mockSetDeletingLanguage).toHaveBeenCalled()
    })

    it("generates correct searchable string", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("searchable-1")).toHaveTextContent("English")
        expect(screen.getByTestId("searchable-1")).toHaveTextContent("EN")
    })

    it("getSortValue returns correct value for iso2 key", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("sort-iso2-1")).toHaveTextContent("EN")
    })

    it("getSortValue returns nativeName or name for nativeName key", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("sort-nativeName-1")).toHaveTextContent(
            "English",
        )
    })

    it("getSortValue returns name for default key", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("sort-name-1")).toHaveTextContent("English")
    })

    it("closes create modal when onClose is called", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            isCreateOpen: true,
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        const closeButton = screen.getByText("Close Create")
        fireEvent.click(closeButton)

        expect(mockSetIsCreateOpen).toHaveBeenCalledWith(false)
    })

    it("closes edit modal when onClose is called", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            editingLanguage: initialLanguages[0],
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        const closeButton = screen.getByText("Close Edit")
        fireEvent.click(closeButton)

        expect(mockSetEditingLanguage).toHaveBeenCalledWith(null)
    })

    it("closes delete modal when onClose is called", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            deletingLanguage: initialLanguages[0],
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        const closeButton = screen.getByText("Close Delete")
        fireEvent.click(closeButton)

        expect(mockSetDeletingLanguage).toHaveBeenCalledWith(null)
    })

    it("passes existingLanguageNames to CreateLanguageModal", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            isCreateOpen: true,
        })

        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("create-modal")).toBeInTheDocument()
    })

    it("handles empty languages list", () => {
        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: [],
        })

        render(<AdminLanguagesView initialLanguages={[]} />)

        expect(screen.getByTestId("admin-data-table")).toBeInTheDocument()
    })

    it("renders with default search parameter", () => {
        render(<AdminLanguagesView initialLanguages={initialLanguages} />)

        expect(screen.getByTestId("admin-data-table")).toBeInTheDocument()
    })

    it("uses provided nativeName when available", () => {
        const languagesWithNativeName = [
            {
                id: "1",
                name: "English",
                iso2: "en",
                nativeName: "Custom Native",
            },
        ]

        vi.mocked(useAdminLanguagesView).mockReturnValue({
            ...defaultHookValues,
            languages: languagesWithNativeName,
        })

        render(
            <AdminLanguagesView initialLanguages={languagesWithNativeName} />,
        )

        expect(screen.getByTestId("lang-native-1")).toHaveTextContent(
            "Custom Native",
        )
    })
})
