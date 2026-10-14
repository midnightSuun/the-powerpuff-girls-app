import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCreatePositionModal } from "@/modules/positions/hooks/use-create-position-modal"

import { CreatePositionModal } from "../ui/create-position-admin-modal"

vi.mock("@/modules/positions/hooks/use-create-position-modal", () => ({
    useCreatePositionModal: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        onClose,
        onConfirm,
        children,
    }: {
        isOpen: boolean
        title: string
        onClose: () => void
        onConfirm: () => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h1>{title}</h1>
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                <button data-testid="modal-confirm" onClick={onConfirm}>
                    Confirm
                </button>
                {children}
            </div>
        ) : null,
}))

type HookReturnType = ReturnType<typeof useCreatePositionModal>

describe("CreatePositionModal", () => {
    const mockSetName = vi.fn()
    const mockHandleSubmit = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()

    const defaultHookValues: HookReturnType = {
        name: "",
        setName: mockSetName,
        inlineError: null,
        error: null,
        isSubmitting: false,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useCreatePositionModal).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders modal when isOpen is true", () => {
        render(
            <CreatePositionModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByRole("textbox")).toBeInTheDocument()
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <CreatePositionModal
                isOpen={false}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("updates name value on input change", () => {
        render(
            <CreatePositionModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        const input = screen.getByRole("textbox")
        fireEvent.change(input, { target: { value: "Lead Developer" } })

        expect(mockSetName).toHaveBeenCalledWith("Lead Developer")
    })

    it("renders inline error message when inlineError is present", () => {
        vi.mocked(useCreatePositionModal).mockReturnValue({
            ...defaultHookValues,
            inlineError: "alreadyExists",
        })

        render(
            <CreatePositionModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByText("alreadyExists")).toBeInTheDocument()
    })

    it("renders general error message when error is present", () => {
        vi.mocked(useCreatePositionModal).mockReturnValue({
            ...defaultHookValues,
            error: "Server creation failed",
        })

        render(
            <CreatePositionModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByText("Server creation failed")).toBeInTheDocument()
    })

    it("triggers handleSubmit when confirm button is clicked", () => {
        render(
            <CreatePositionModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        const confirmButton = screen.getByTestId("modal-confirm")
        fireEvent.click(confirmButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
