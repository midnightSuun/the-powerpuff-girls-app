import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Proficiency } from "@/gql/generated/graphql"
import { useLanguagesPage } from "@/modules/languages/hooks/use-languages-page"

import { LanguagesPage } from "../ui/languages-page"

vi.mock("next-intl", () => {
    const tFn = (key: string) => key
    tFn.rich = (key: string, values?: Record<string, string | number>) =>
        values?.count ? `confirmation-${values.count}` : key

    return {
        useTranslations: () => tFn,
        useLocale: () => "en",
    }
})

vi.mock("@/modules/languages/hooks/use-languages-page", () => ({
    useLanguagesPage: vi.fn(),
}))

vi.mock("../ui/components/user/add-language-modal", () => ({
    AddLanguageModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="add-language-modal">Add Modal</div> : null,
}))

vi.mock("../ui/components/user/edit-language-modal", () => ({
    EditLanguageModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="edit-language-modal">Edit Modal</div> : null,
}))

vi.mock("../ui/components/user/delete-languages-modal", () => ({
    DeleteLanguagesModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? (
            <div data-testid="delete-languages-modal">Delete Modal</div>
        ) : null,
}))

vi.mock("@/components/ui/progress-list-item", () => ({
    ProgressListItem: ({
        name,
        onSelect,
    }: {
        name: string
        onSelect: () => void
    }) => (
        <div data-testid={`progress-item-${name}`} onClick={onSelect}>
            <span>{name}</span>
        </div>
    ),
}))

type HookReturnType = ReturnType<typeof useLanguagesPage>

describe("LanguagesPage", () => {
    const mockSetIsRemovalMode = vi.fn()
    const mockSetSelectedLanguages = vi.fn()
    const mockSetIsAddOpen = vi.fn()
    const mockSetEditingLang = vi.fn()
    const mockSetIsRemoveConfirmOpen = vi.fn()
    const mockToggleSelectLanguage = vi.fn()
    const mockHandleAdd = vi.fn()
    const mockHandleUpdate = vi.fn()
    const mockHandleDelete = vi.fn()

    const initialUserLanguages = [
        { name: "English", proficiency: "ADVANCED" as Proficiency },
        { name: "Spanish", proficiency: "INTERMEDIATE" as Proficiency },
    ]

    const allSystemLanguages = [
        { id: "1", name: "English" },
        { id: "2", name: "Spanish" },
        { id: "3", name: "French" },
    ]

    const defaultHookValues: HookReturnType = {
        isRemovalMode: false,
        setIsRemovalMode: mockSetIsRemovalMode,
        selectedLanguages: [],
        setSelectedLanguages: mockSetSelectedLanguages,
        isAddOpen: false,
        setIsAddOpen: mockSetIsAddOpen,
        editingLang: null,
        setEditingLang: mockSetEditingLang,
        isRemoveConfirmOpen: false,
        setIsRemoveConfirmOpen: mockSetIsRemoveConfirmOpen,
        toggleSelectLanguage: mockToggleSelectLanguage,
        handleAdd: mockHandleAdd,
        handleUpdate: mockHandleUpdate,
        handleDelete: mockHandleDelete,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useLanguagesPage).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders list of user languages and management actions when canManageLanguages is true", () => {
        render(
            <LanguagesPage
                initialUserLanguages={initialUserLanguages}
                allSystemLanguages={allSystemLanguages}
                userId="user-1"
                canManageLanguages={true}
            />,
        )

        expect(screen.getByText("currentLanguages")).toBeInTheDocument()
        expect(screen.getByTestId("progress-item-English")).toBeInTheDocument()
        expect(screen.getByTestId("progress-item-Spanish")).toBeInTheDocument()
        expect(screen.getAllByText("actions.add")[0]).toBeInTheDocument()
        expect(screen.getAllByText("actions.remove")[0]).toBeInTheDocument()
    })

    it("filters languages based on search prop", () => {
        render(
            <LanguagesPage
                initialUserLanguages={initialUserLanguages}
                allSystemLanguages={allSystemLanguages}
                userId="user-1"
                canManageLanguages={true}
                search="spanish"
            />,
        )

        expect(
            screen.queryByTestId("progress-item-English"),
        ).not.toBeInTheDocument()
        expect(screen.getByTestId("progress-item-Spanish")).toBeInTheDocument()
    })

    it("opens add language modal when add button is clicked", () => {
        render(
            <LanguagesPage
                initialUserLanguages={initialUserLanguages}
                allSystemLanguages={allSystemLanguages}
                userId="user-1"
                canManageLanguages={true}
            />,
        )

        const addButton = screen.getAllByText("actions.add")[0]
        fireEvent.click(addButton)
        expect(mockSetIsAddOpen).toHaveBeenCalledWith(true)
    })

    it("activates removal mode when remove button is clicked", () => {
        render(
            <LanguagesPage
                initialUserLanguages={initialUserLanguages}
                allSystemLanguages={allSystemLanguages}
                userId="user-1"
                canManageLanguages={true}
            />,
        )

        const removeButton = screen.getAllByText("actions.remove")[0]
        fireEvent.click(removeButton)
        expect(mockSetIsRemovalMode).toHaveBeenCalledWith(true)
    })

    it("renders removal action buttons and handles cancellation", () => {
        vi.mocked(useLanguagesPage).mockReturnValue({
            ...defaultHookValues,
            isRemovalMode: true,
            selectedLanguages: ["English"],
        })

        render(
            <LanguagesPage
                initialUserLanguages={initialUserLanguages}
                allSystemLanguages={allSystemLanguages}
                userId="user-1"
                canManageLanguages={true}
            />,
        )

        expect(screen.getAllByText("actions.cancel")[0]).toBeInTheDocument()
        expect(screen.getByText(/deleteSelected/i)).toBeInTheDocument()

        fireEvent.click(screen.getAllByText("actions.cancel")[0])
        expect(mockSetIsRemovalMode).toHaveBeenCalledWith(false)
        expect(mockSetSelectedLanguages).toHaveBeenCalledWith([])
    })

    it("renders edit language modal when editingLang is set", () => {
        vi.mocked(useLanguagesPage).mockReturnValue({
            ...defaultHookValues,
            editingLang: {
                name: "English",
                proficiency: "ADVANCED" as Proficiency,
            },
        })

        render(
            <LanguagesPage
                initialUserLanguages={initialUserLanguages}
                allSystemLanguages={allSystemLanguages}
                userId="user-1"
                canManageLanguages={true}
            />,
        )

        expect(screen.getByTestId("edit-language-modal")).toBeInTheDocument()
    })
})
