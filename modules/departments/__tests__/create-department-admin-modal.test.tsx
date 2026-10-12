import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateDepartmentModal } from "@/modules/departments/hooks/use-create-department-modal"

import { CreateDepartmentModal } from "../ui/components/create-department-admin-modal"

vi.mock("@/modules/departments/hooks/use-create-department-modal", () => ({
    useCreateDepartmentModal: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        isPending,
        cancelText,
        confirmText,
        pendingText,
        onConfirm,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        title: string
        error?: string | null
        isPending: boolean
        cancelText: string
        confirmText: string
        pendingText: string
        onConfirm: () => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h1>{title}</h1>
                <div data-testid="is-pending">{String(isPending)}</div>
                <div>{cancelText}</div>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isPending}
                    data-testid="confirm-button"
                >
                    {isPending ? pendingText : confirmText}
                </button>
                {children}
            </div>
        ) : null,
}))

vi.mock("@/components/ui/input", () => ({
    Input: ({
        label,
        value,
        onChange,
        placeholder,
    }: {
        label?: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        placeholder?: string
    }) => (
        <label>
            {label}
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                data-testid="department-input"
            />
        </label>
    ),
}))

describe("CreateDepartmentModal", () => {
    const mockSetName = vi.fn()
    const mockHandleSubmit = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()

    const defaultHookReturn = {
        name: "",
        setName: mockSetName,
        inlineError: null,
        error: null,
        isSubmitting: false,
        isValid: false,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCreateDepartmentModal).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<
                typeof useCreateDepartmentModal
            >,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders modal and fields correctly when open", () => {
        render(
            <CreateDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByTestId("department-input")).toBeInTheDocument()
        expect(screen.getByTestId("confirm-button")).toHaveTextContent("create")
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <CreateDepartmentModal
                isOpen={false}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("calls setName when user types into the input", async () => {
        const user = userEvent.setup()
        render(
            <CreateDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        const input = screen.getByTestId("department-input")
        await user.type(input, "Engineering")

        expect(mockSetName).toHaveBeenCalled()
    })

    it("displays inline error when duplicate name is detected", () => {
        vi.mocked(useCreateDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            inlineError: "alreadyExists",
        } as unknown as ReturnType<typeof useCreateDepartmentModal>)

        render(
            <CreateDepartmentModal
                isOpen={true}
                existingNames={["Engineering"]}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByText("alreadyExists")).toBeInTheDocument()
    })

    it("displays error message when server error occurs", () => {
        vi.mocked(useCreateDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            error: "Server creation failed",
        } as unknown as ReturnType<typeof useCreateDepartmentModal>)

        render(
            <CreateDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByText("Server creation failed")).toBeInTheDocument()
    })

    it("shows saving text and disables button when isSubmitting is true", () => {
        vi.mocked(useCreateDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            isSubmitting: true,
        } as unknown as ReturnType<typeof useCreateDepartmentModal>)

        render(
            <CreateDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("is-pending")).toHaveTextContent("true")
        expect(screen.getByTestId("confirm-button")).toHaveTextContent("saving")
        expect(screen.getByTestId("confirm-button")).toBeDisabled()
    })

    it("triggers handleSubmit when confirm button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <CreateDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
            />,
        )

        const confirmButton = screen.getByTestId("confirm-button")
        await user.click(confirmButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
