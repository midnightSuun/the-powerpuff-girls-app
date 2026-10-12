import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useEditDepartmentModal } from "@/modules/departments/hooks/use-edit-department-modal"

import { EditDepartmentModal } from "../ui/components/edit-department-admin-modal"

vi.mock("@/modules/departments/hooks/use-edit-department-modal", () => ({
    useEditDepartmentModal: vi.fn(),
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
                    data-testid="save-button"
                >
                    {isPending ? pendingText : confirmText}
                </button>
                {children}{" "}
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

describe("EditDepartmentModal", () => {
    const mockSetName = vi.fn()
    const mockHandleSubmit = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const mockDepartment = {
        id: "dept-1",
        name: "Engineering",
    }

    const defaultHookReturn = {
        name: "Engineering",
        setName: mockSetName,
        inlineError: null,
        error: null,
        isSubmitting: false,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useEditDepartmentModal).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<
                typeof useEditDepartmentModal
            >,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders modal and fields with department name correctly when open", () => {
        render(
            <EditDepartmentModal
                isOpen={true}
                department={mockDepartment}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByTestId("department-input")).toHaveValue(
            "Engineering",
        )
        expect(screen.getByTestId("save-button")).toHaveTextContent("save")
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <EditDepartmentModal
                isOpen={false}
                department={mockDepartment}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("calls setName when user edits the input value", async () => {
        const user = userEvent.setup()
        render(
            <EditDepartmentModal
                isOpen={true}
                department={mockDepartment}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        const input = screen.getByTestId("department-input")
        await user.clear(input)
        await user.type(input, "New Engineering")

        expect(mockSetName).toHaveBeenCalled()
    })

    it("displays inline error when duplicate name is detected", () => {
        vi.mocked(useEditDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            inlineError: "alreadyExists",
        } as unknown as ReturnType<typeof useEditDepartmentModal>)

        render(
            <EditDepartmentModal
                isOpen={true}
                department={mockDepartment}
                existingNames={["Engineering", "HR"]}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByText("alreadyExists")).toBeInTheDocument()
    })

    it("displays error message when update error occurs", () => {
        vi.mocked(useEditDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            error: "Failed to update department",
        } as unknown as ReturnType<typeof useEditDepartmentModal>)

        render(
            <EditDepartmentModal
                isOpen={true}
                department={mockDepartment}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(
            screen.getByText("Failed to update department"),
        ).toBeInTheDocument()
    })

    it("shows saving text and disables button when isSubmitting is true", () => {
        vi.mocked(useEditDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            isSubmitting: true,
        } as unknown as ReturnType<typeof useEditDepartmentModal>)

        render(
            <EditDepartmentModal
                isOpen={true}
                department={mockDepartment}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("is-pending")).toHaveTextContent("true")
        expect(screen.getByTestId("save-button")).toHaveTextContent("saving")
        expect(screen.getByTestId("save-button")).toBeDisabled()
    })

    it("triggers handleSubmit when save button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <EditDepartmentModal
                isOpen={true}
                department={mockDepartment}
                onClose={mockOnClose}
                onUpdate={mockOnUpdate}
            />,
        )

        const saveButton = screen.getByTestId("save-button")
        await user.click(saveButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
