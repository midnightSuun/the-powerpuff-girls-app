import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { BaseModal } from "../base-modal"

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        onClick,
        disabled,
        type,
        className,
    }: {
        children: React.ReactNode
        onClick?: () => void
        disabled?: boolean
        type?: "button" | "submit" | "reset"
        className?: string
    }) => (
        <button
            type={type || "button"}
            onClick={onClick}
            disabled={disabled}
            className={className}
        >
            {children}
        </button>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("BaseModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: "Confirm Action",
        isPending: false,
        isValid: true,
        cancelText: "Cancel",
        confirmText: "Confirm",
        pendingText: "Processing...",
        children: <div data-testid="modal-content">Modal body content</div>,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(<BaseModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("renders modal with title, children, and action buttons when open", () => {
        render(<BaseModal {...defaultProps} />)

        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText("Confirm Action")).toBeInTheDocument()
        expect(screen.getByTestId("modal-content")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Cancel" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Confirm" }),
        ).toBeInTheDocument()
    })

    it("displays error message when provided", () => {
        render(<BaseModal {...defaultProps} error="Something went wrong" />)

        expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    })

    it("displays pendingText and disables buttons when isPending is true", () => {
        render(<BaseModal {...defaultProps} isPending={true} />)

        const confirmButton = screen.getByRole("button", {
            name: "Processing...",
        })
        const cancelButton = screen.getByRole("button", { name: "Cancel" })
        const closeIconButton = screen.getByRole("button", {
            name: "Close modal",
        })

        expect(confirmButton).toBeDisabled()
        expect(cancelButton).toBeDisabled()
        expect(closeIconButton).toBeDisabled()
    })

    it("disables confirm button when isValid is false", () => {
        render(<BaseModal {...defaultProps} isValid={false} />)

        const confirmButton = screen.getByRole("button", { name: "Confirm" })
        expect(confirmButton).toBeDisabled()
    })

    it("calls onClose when close icon or cancel button is clicked", () => {
        const onClose = vi.fn()
        render(<BaseModal {...defaultProps} onClose={onClose} />)

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
        expect(onClose).toHaveBeenCalledTimes(1)

        fireEvent.click(screen.getByRole("button", { name: "Close modal" }))
        expect(onClose).toHaveBeenCalledTimes(2)
    })

    it("calls onConfirm when confirm button is clicked without onSubmit", () => {
        const onConfirm = vi.fn()
        render(<BaseModal {...defaultProps} onConfirm={onConfirm} />)

        fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it("calls onSubmit when form is submitted", () => {
        const onSubmit = vi.fn((e) => e.preventDefault())
        render(<BaseModal {...defaultProps} onSubmit={onSubmit} />)

        fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it("closes on Escape key press when not pending", () => {
        const onClose = vi.fn()
        render(<BaseModal {...defaultProps} onClose={onClose} />)

        fireEvent.keyDown(document, { key: "Escape" })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("does not close on Escape when a nested control already handled it", () => {
        const onClose = vi.fn()
        render(<BaseModal {...defaultProps} onClose={onClose} />)

        const event = new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true,
        })
        event.preventDefault()
        document.dispatchEvent(event)
        expect(onClose).not.toHaveBeenCalled()
    })

    it("does not close on Escape key press when pending", () => {
        const onClose = vi.fn()
        render(
            <BaseModal {...defaultProps} isPending={true} onClose={onClose} />,
        )

        fireEvent.keyDown(document, { key: "Escape" })
        expect(onClose).not.toHaveBeenCalled()
    })

    it("closes when clicking on overlay background", () => {
        const onClose = vi.fn()
        render(<BaseModal {...defaultProps} onClose={onClose} />)

        const dialog = screen.getByRole("dialog")
        const overlay = dialog.parentElement!

        fireEvent.click(overlay, { target: overlay, currentTarget: overlay })
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
