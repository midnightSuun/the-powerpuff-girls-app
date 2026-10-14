import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateLanguageAdminModal } from "@/modules/languages/hooks/use-create-language-admin-modal"

import { CreateLanguageModal } from "../ui/components/admin/create-language-admin-modal"

vi.mock("@/modules/languages/hooks/use-create-language-admin-modal", () => ({
    useCreateLanguageAdminModal: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        children,
        onSubmit,
        error,
        isPending,
        isValid,
    }: {
        isOpen: boolean
        title: string
        children: React.ReactNode
        onSubmit: () => void
        error?: string | null
        isPending?: boolean
        isValid?: boolean
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h2>{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                {children}
                <button
                    disabled={isPending || !isValid}
                    onClick={onSubmit}
                    data-testid="modal-submit"
                >
                    Submit
                </button>
            </div>
        ) : null,
}))

describe("CreateLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()
    const mockSetName = vi.fn()
    const mockSetIso2 = vi.fn()
    const mockSetNativeName = vi.fn()
    const mockHandleSubmit = vi.fn()

    const defaultHookValues = {
        name: "",
        setName: mockSetName,
        iso2: "",
        setIso2: mockSetIso2,
        nativeName: "",
        setNativeName: mockSetNativeName,
        inlineError: null as string | null,
        error: null as string | null,
        isSubmitting: false,
        isValid: false,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useCreateLanguageAdminModal).mockReturnValue(
            defaultHookValues,
        )
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(
            <CreateLanguageModal
                isOpen={false}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("renders correctly when isOpen is true", () => {
        render(
            <CreateLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("languageName")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("isoCode")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("nativeName")).toBeInTheDocument()
    })

    it("handles input changes correctly", () => {
        render(
            <CreateLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        const nameInput = screen.getByPlaceholderText("languageName")
        const isoInput = screen.getByPlaceholderText("isoCode")
        const nativeInput = screen.getByPlaceholderText("nativeName")

        fireEvent.change(nameInput, { target: { value: "French" } })
        expect(mockSetName).toHaveBeenCalledWith("French")

        fireEvent.change(isoInput, { target: { value: "fr" } })
        expect(mockSetIso2).toHaveBeenCalledWith("FR")

        fireEvent.change(nativeInput, { target: { value: "Français" } })
        expect(mockSetNativeName).toHaveBeenCalledWith("Français")
    })

    it("displays inline error and modal error when provided", () => {
        vi.mocked(useCreateLanguageAdminModal).mockReturnValue({
            ...defaultHookValues,
            inlineError: "Name is required",
            error: "Server creation failed",
        })

        render(
            <CreateLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByText("Name is required")).toBeInTheDocument()
        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Server creation failed",
        )
    })

    it("triggers handleSubmit when submit button is clicked and form is valid", () => {
        vi.mocked(useCreateLanguageAdminModal).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(
            <CreateLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        const submitButton = screen.getByTestId("modal-submit")
        expect(submitButton).not.toBeDisabled()

        fireEvent.click(submitButton)
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
