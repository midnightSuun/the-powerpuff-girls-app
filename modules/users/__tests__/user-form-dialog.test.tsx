import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserFormDialog } from "../ui/user-form-dialog"

vi.mock("../ui/user-form-field", () => ({
    UserFormTextField: vi.fn(({ label, value, onChange, disabled }) => (
        <label>
            {label}
            <input
                data-testid={`textfield-${label}`}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    )),
    UserFormSelectField: vi.fn(({ label, value, onChange }) => (
        <label>
            {label}
            <select
                data-testid={`select-${label}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value={value}>{value}</option>
            </select>
        </label>
    )),
}))

vi.mock("../ui/create-user-fields", () => ({
    CreateUserPasswordInput: vi.fn(({ label, value, onChange, disabled }) => (
        <label>
            {label}
            <input
                data-testid="password-input"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    )),
}))

vi.mock("@/components/ui/dialog", () => ({
    Dialog: vi.fn(({ children, open }) =>
        open ? <div data-testid="dialog">{children}</div> : null,
    ),
    DialogContent: vi.fn(({ children }) => <div>{children}</div>),
    DialogHeader: vi.fn(({ children }) => <div>{children}</div>),
    DialogTitle: vi.fn(({ children }) => <h1>{children}</h1>),
    DialogDescription: vi.fn(({ children }) => <p>{children}</p>),
    DialogClose: vi.fn(({ children }) => (
        <button type="button">{children}</button>
    )),
    DialogFooter: vi.fn(({ children }) => <div>{children}</div>),
}))

describe("UserFormDialog Component", () => {
    const mockOnOpenChange = vi.fn()
    const mockOnSubmit = vi.fn((e) => e.preventDefault())
    const mockOnFieldChange = vi.fn()

    const defaultProps = {
        open: true,
        onOpenChange: mockOnOpenChange,
        title: "Create User",
        description: "Fill in the user details",
        submitLabel: "Save",
        isSubmitting: false,
        onSubmit: mockOnSubmit,
        email: "test@example.com",
        password: "secretpassword",
        firstName: "John",
        lastName: "Doe",
        departmentId: "dep-1",
        positionId: "pos-1",
        role: "ADMIN",
        departments: [{ id: "dep-1", name: "Engineering" }],
        positions: [{ id: "pos-1", name: "Developer" }],
        roleOptions: [{ id: "ADMIN", name: "Admin" }],
        onFieldChange: mockOnFieldChange,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders dialog with title, description, and form fields correctly", () => {
        render(<UserFormDialog {...defaultProps} />)

        expect(screen.getByText("Create User")).toBeInTheDocument()
        expect(screen.getByText("Fill in the user details")).toBeInTheDocument()
        expect(screen.getByTestId("password-input")).toHaveValue(
            "secretpassword",
        )
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    })

    it("locks credentials and masks password when lockCredentials is true", () => {
        render(<UserFormDialog {...defaultProps} lockCredentials={true} />)

        const passwordInput = screen.getByTestId("password-input")
        expect(passwordInput).toHaveValue("••••••••")
        expect(passwordInput).toBeDisabled()
    })

    it("triggers onFieldChange when text field value changes", async () => {
        render(<UserFormDialog {...defaultProps} />)

        const firstNameInput = screen.getByTestId("textfield-firstName")

        fireEvent.change(firstNameInput, { target: { value: "Jane" } })

        expect(mockOnFieldChange).toHaveBeenCalledWith("firstName", "Jane")
    })

    it("calls onSubmit when form is submitted", async () => {
        render(<UserFormDialog {...defaultProps} />)

        const submitButton = screen.getByRole("button", { name: "Save" })
        await userEvent.click(submitButton)

        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    it("disables submit button when isSubmitting is true", () => {
        render(<UserFormDialog {...defaultProps} isSubmitting={true} />)

        const submitButton = screen.getByRole("button", { name: "Save" })
        expect(submitButton).toBeDisabled()
    })
})
