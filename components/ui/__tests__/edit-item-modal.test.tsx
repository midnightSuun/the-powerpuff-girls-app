import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { EditItemModal } from "../edit-item-modal"

vi.mock("../base-modal", () => ({
    BaseModal: ({
        isOpen,
        onClose,
        onSubmit,
        title,
        error,
        isPending,
        isValid,
        cancelText,
        confirmText,
        pendingText,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        onSubmit?: (e: React.SyntheticEvent) => void
        title: string
        error?: string | null
        isPending: boolean
        isValid: boolean
        cancelText: string
        confirmText: string
        pendingText: string
        children: ReactNode
    }) => {
        if (!isOpen) return null
        return (
            <div data-testid="base-modal">
                <h2 data-testid="modal-title">{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="modal-children">{children}</div>
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="cancel-btn"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onClick={(e) => onSubmit?.(e)}
                    disabled={isPending || !isValid}
                    data-testid="submit-btn"
                >
                    {isPending ? pendingText : confirmText}
                </button>
            </div>
        )
    },
}))

vi.mock("@/components/ui/select", () => ({
    Select: ({
        children,
        disabled,
        value,
    }: {
        children: ReactNode
        disabled?: boolean
        value?: string
    }) => (
        <div
            data-testid="select-root"
            data-disabled={disabled}
            data-value={value}
        >
            {children}
        </div>
    ),
    SelectTrigger: ({
        children,
        className,
    }: {
        children: ReactNode
        className?: string
    }) => (
        <div data-testid="select-trigger" className={className}>
            {children}
        </div>
    ),
    SelectValue: ({ children }: { children: ReactNode }) => (
        <span data-testid="select-value">{children}</span>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("EditItemModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onSubmit: vi.fn((e) => e.preventDefault()),
        title: "Edit Item",
        itemNameLabel: "Item Name",
        itemNameValue: "Super Widget",
        levelSelectLabel: "Select Level",
        cancelText: "Cancel",
        submitText: "Save Changes",
        updatingText: "Saving...",
        isSubmitting: false,
        isValid: true,
        levelSelectNode: (
            <div data-testid="level-select-node">Level Component</div>
        ),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(<EditItemModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("renders modal with title, item name value, and custom level node when open", () => {
        render(<EditItemModal {...defaultProps} />)

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByTestId("modal-title")).toHaveTextContent("Edit Item")
        expect(screen.getByText("Item Name")).toBeInTheDocument()
        expect(screen.getByTestId("select-value")).toHaveTextContent(
            "Super Widget",
        )
        expect(screen.getByTestId("level-select-node")).toBeInTheDocument()
        expect(screen.getByTestId("cancel-btn")).toHaveTextContent("Cancel")
        expect(screen.getByTestId("submit-btn")).toHaveTextContent(
            "Save Changes",
        )
    })

    it("displays error message when provided", () => {
        render(
            <EditItemModal {...defaultProps} error="Failed to update item" />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to update item",
        )
    })

    it("shows updatingText and disables submit button when isSubmitting is true", () => {
        render(<EditItemModal {...defaultProps} isSubmitting={true} />)

        const submitBtn = screen.getByTestId("submit-btn")
        expect(submitBtn).toHaveTextContent("Saving...")
        expect(submitBtn).toBeDisabled()
    })

    it("disables submit button when isValid is false", () => {
        render(<EditItemModal {...defaultProps} isValid={false} />)

        const submitBtn = screen.getByTestId("submit-btn")
        expect(submitBtn).toBeDisabled()
    })

    it("calls onClose when cancel button is clicked", () => {
        const onClose = vi.fn()
        render(<EditItemModal {...defaultProps} onClose={onClose} />)

        fireEvent.click(screen.getByTestId("cancel-btn"))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("calls onSubmit when submit button is clicked", () => {
        const onSubmit = vi.fn((e) => e.preventDefault())
        render(<EditItemModal {...defaultProps} onSubmit={onSubmit} />)

        fireEvent.click(screen.getByTestId("submit-btn"))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })
})
