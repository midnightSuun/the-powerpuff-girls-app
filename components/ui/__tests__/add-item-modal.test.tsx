import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AddItemModal, type ItemOption } from "../add-item-modal"

vi.mock("./base-modal", () => ({
    BaseModal: ({
        isOpen,
        onClose,
        title,
        error,
        isValid,
        cancelText,
        confirmText,
        onSubmit,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        title: string
        error?: string | null
        isValid: boolean
        cancelText: string
        confirmText: string
        onSubmit: (e: React.SyntheticEvent) => void
        children: React.ReactNode
    }) => {
        if (!isOpen) return null
        return (
            <div data-testid="base-modal">
                <h1>{title}</h1>
                {error && <div data-testid="modal-error">{error}</div>}
                <div>{children}</div>
                <button type="button" onClick={onClose}>
                    {cancelText}
                </button>
                <button
                    type="button"
                    disabled={!isValid}
                    onClick={(e) => onSubmit(e)}
                >
                    {confirmText}
                </button>
            </div>
        )
    },
}))

vi.mock("@/components/ui/select", () => ({
    Select: ({
        children,
        value,
        onValueChange,
    }: {
        children: React.ReactNode
        value: string
        onValueChange: (value: string) => void
    }) => (
        <div data-testid="select" data-value={value}>
            {children}
            <button
                type="button"
                data-testid="select-change-trigger"
                onClick={() => onValueChange("2")}
            >
                Change Value
            </button>
        </div>
    ),
    SelectTrigger: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => (
        <div data-testid="select-trigger" className={className}>
            {children}
        </div>
    ),
    SelectValue: ({
        children,
        placeholder,
    }: {
        children: React.ReactNode
        placeholder: string
    }) => (
        <span data-testid="select-value" data-placeholder={placeholder}>
            {children || placeholder}
        </span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
        children,
        value,
    }: {
        children: React.ReactNode
        value: string
    }) => (
        <div data-testid="select-item" data-value={value}>
            {children}
        </div>
    ),
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

const mockOptions: ItemOption[] = [
    { id: 1, name: "React" },
    { id: 2, name: "TypeScript" },
]

describe("AddItemModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: "Add Skill",
        itemPlaceholder: "Select skill",
        allItemsAddedText: "All items added",
        addingText: "Adding...",
        submitText: "Submit",
        cancelText: "Cancel",
        isSubmitting: false,
        isValid: true,
        selectedId: "",
        onSelectChange: vi.fn(),
        availableOptions: mockOptions,
        levelSelectNode: (
            <div data-testid="level-select-node">Level Select</div>
        ),
        onSubmit: vi.fn(),
    }

    it("renders modal with title, options, and levelSelectNode when open", () => {
        render(<AddItemModal {...defaultProps} />)

        expect(screen.getByText("Add Skill")).toBeInTheDocument()
        expect(screen.getByTestId("level-select-node")).toBeInTheDocument()
        expect(screen.getAllByTestId("select-item")).toHaveLength(2)
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })

    it("renders empty options text when availableOptions is empty", () => {
        render(<AddItemModal {...defaultProps} availableOptions={[]} />)

        expect(screen.getByText("All items added")).toBeInTheDocument()
    })

    it("displays item placeholder label when selectedId has value", () => {
        render(<AddItemModal {...defaultProps} selectedId="1" />)

        expect(screen.getByText("Select skill")).toBeInTheDocument()
    })

    it("calls onSelectChange when option is selected", () => {
        const onSelectChange = vi.fn()
        render(
            <AddItemModal {...defaultProps} onSelectChange={onSelectChange} />,
        )

        fireEvent.click(screen.getByTestId("select-change-trigger"))

        expect(onSelectChange).toHaveBeenCalledWith("2")
    })

    it("calls onClose when cancel button is clicked", () => {
        const onClose = vi.fn()
        render(<AddItemModal {...defaultProps} onClose={onClose} />)

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("calls onSubmit when submit button is clicked and form is valid", () => {
        const onSubmit = vi.fn()
        render(
            <AddItemModal
                {...defaultProps}
                onSubmit={onSubmit}
                isValid={true}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: "Submit" }))

        expect(onSubmit).toHaveBeenCalledTimes(1)
    })
})
