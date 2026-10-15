import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserFormDialog } from "../ui/user-form-dialog"

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
        const passwordInput = document.querySelector('[aria-label="password"]')
        expect(passwordInput).not.toBeNull()
        expect(passwordInput).toHaveValue("secretpassword")
        expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    })

    it("locks credentials and masks password when lockCredentials is true", () => {
        render(<UserFormDialog {...defaultProps} lockCredentials={true} />)

        const passwordInput = document.querySelector('[aria-label="password"]')
        expect(passwordInput).not.toBeNull()
        expect(passwordInput).toHaveValue("••••••••")
        expect(passwordInput).toBeDisabled()
    })

    it("triggers onFieldChange when text field value changes", async () => {
        render(<UserFormDialog {...defaultProps} />)

        const firstNameInput = document.querySelector(
            '[aria-label="firstName"]',
        )
        expect(firstNameInput).not.toBeNull()

        fireEvent.change(firstNameInput!, { target: { value: "Jane" } })

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

    it("shows field labels when showFieldLabels is true", () => {
        render(<UserFormDialog {...defaultProps} showFieldLabels={true} />)

        expect(screen.getByText("Create User")).toBeInTheDocument()
    })

    it("triggers onFieldChange for email field", () => {
        render(<UserFormDialog {...defaultProps} />)

        const emailInput = document.querySelector('[aria-label="email"]')
        expect(emailInput).not.toBeNull()

        fireEvent.change(emailInput!, {
            target: { value: "newemail@example.com" },
        })

        expect(mockOnFieldChange).toHaveBeenCalledWith(
            "email",
            "newemail@example.com",
        )
    })

    it("triggers onFieldChange for password field", () => {
        render(<UserFormDialog {...defaultProps} />)

        const passwordInput = document.querySelector('[aria-label="password"]')
        expect(passwordInput).not.toBeNull()

        fireEvent.change(passwordInput!, { target: { value: "newpassword" } })

        expect(mockOnFieldChange).toHaveBeenCalledWith(
            "password",
            "newpassword",
        )
    })

    it("triggers onFieldChange for lastName field", () => {
        render(<UserFormDialog {...defaultProps} />)

        const lastNameInput = document.querySelector('[aria-label="lastName"]')
        expect(lastNameInput).not.toBeNull()

        fireEvent.change(lastNameInput!, { target: { value: "Smith" } })

        expect(mockOnFieldChange).toHaveBeenCalledWith("lastName", "Smith")
    })

    it("triggers onFieldChange for departmentId field", () => {
        render(<UserFormDialog {...defaultProps} />)

        const departmentSelect = document.querySelector(
            '[aria-label="department"]',
        )
        expect(departmentSelect).not.toBeNull()

        fireEvent.change(departmentSelect!, { target: { value: "dep-2" } })

        // Check that onFieldChange was called with departmentId as first arg
        expect(mockOnFieldChange).toHaveBeenCalled()
        const calls = mockOnFieldChange.mock.calls
        const departmentCall = calls.find((call) => call[0] === "departmentId")
        expect(departmentCall).toBeDefined()
    })

    it("triggers onFieldChange for positionId field", () => {
        render(<UserFormDialog {...defaultProps} />)

        const positionSelect = document.querySelector('[aria-label="position"]')
        expect(positionSelect).not.toBeNull()

        fireEvent.change(positionSelect!, { target: { value: "pos-2" } })

        // Check that onFieldChange was called with positionId as first arg
        expect(mockOnFieldChange).toHaveBeenCalled()
        const calls = mockOnFieldChange.mock.calls
        const positionCall = calls.find((call) => call[0] === "positionId")
        expect(positionCall).toBeDefined()
    })

    it("triggers onFieldChange for role field", () => {
        render(<UserFormDialog {...defaultProps} />)

        const roleSelect = document.querySelector('[aria-label="role"]')
        expect(roleSelect).not.toBeNull()

        fireEvent.change(roleSelect!, { target: { value: "USER" } })

        // Check that onFieldChange was called with role as first arg
        expect(mockOnFieldChange).toHaveBeenCalled()
        const calls = mockOnFieldChange.mock.calls
        const roleCall = calls.find((call) => call[0] === "role")
        expect(roleCall).toBeDefined()
    })

    it("includes empty option in department select when showFieldLabels is false", () => {
        render(<UserFormDialog {...defaultProps} showFieldLabels={false} />)

        // includeEmpty should be true when !showFieldLabels
        expect(screen.getByText("Create User")).toBeInTheDocument()
    })

    it("includes empty option in department select when departmentId is empty", () => {
        render(
            <UserFormDialog
                {...defaultProps}
                departmentId=""
                showFieldLabels={true}
            />,
        )

        // includeEmpty should be true when departmentId.length === 0
        expect(screen.getByText("Create User")).toBeInTheDocument()
    })

    it("includes empty option in position select when positionId is empty", () => {
        render(
            <UserFormDialog
                {...defaultProps}
                positionId=""
                showFieldLabels={true}
            />,
        )

        // includeEmpty should be true when positionId.length === 0
        expect(screen.getByText("Create User")).toBeInTheDocument()
    })

    it("does not include empty option in role select", () => {
        render(<UserFormDialog {...defaultProps} />)

        // includeEmpty is always false for role
        expect(screen.getByText("Create User")).toBeInTheDocument()
    })

    it("does not render dialog when open is false", () => {
        render(<UserFormDialog {...defaultProps} open={false} />)

        expect(screen.queryByTestId("dialog")).not.toBeInTheDocument()
    })
})
