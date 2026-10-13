import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useEditPositionModal } from "@/modules/positions/hooks/use-edit-position-modal"

import { EditPositionModal } from "../ui/edit-position-admin-modal"

vi.mock("@/modules/positions/hooks/use-edit-position-modal", () => ({
    useEditPositionModal: vi.fn(),
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
                    Save
                </button>
                {children}
            </div>
        ) : null,
}))

type HookReturnType = ReturnType<typeof useEditPositionModal>

describe("EditPositionModal", () => {
    const mockSetName = vi.fn()
    const mockHandleSubmit = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const samplePosition = {
        id: "1",
        name: "Frontend Developer",
    }

    const defaultHookValues: HookReturnType = {
        name: "Frontend Developer",
        setName: mockSetName,
        inlineError: null,
        error: null,
        isSubmitting: false,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEditPositionModal).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders modal when isOpen is true with current position name", () => {
        render(
            <EditPositionModal
                isOpen={true}
                position={samplePosition}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByRole("textbox")).toHaveValue("Frontend Developer")
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <EditPositionModal
                isOpen={false}
                position={samplePosition}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("updates name value on input change", () => {
        render(
            <EditPositionModal
                isOpen={true}
                position={samplePosition}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        const input = screen.getByRole("textbox")
        fireEvent.change(input, { target: { value: "Senior Frontend" } })

        expect(mockSetName).toHaveBeenCalledWith("Senior Frontend")
    })

    it("renders inline error message when inlineError is present", () => {
        vi.mocked(useEditPositionModal).mockReturnValue({
            ...defaultHookValues,
            inlineError: "alreadyExists",
        })

        render(
            <EditPositionModal
                isOpen={true}
                position={samplePosition}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByText("alreadyExists")).toBeInTheDocument()
    })

    it("renders general error message when error is present", () => {
        vi.mocked(useEditPositionModal).mockReturnValue({
            ...defaultHookValues,
            error: "Server update failed",
        })

        render(
            <EditPositionModal
                isOpen={true}
                position={samplePosition}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByText("Server update failed")).toBeInTheDocument()
    })

    it("triggers handleSubmit when save button is clicked", () => {
        render(
            <EditPositionModal
                isOpen={true}
                position={samplePosition}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        const saveButton = screen.getByTestId("modal-confirm")
        fireEvent.click(saveButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
