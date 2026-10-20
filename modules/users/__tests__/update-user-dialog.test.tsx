import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    type EditableUser,
    useUpdateUserDialog,
} from "../hooks/use-update-user-dialog"
import { UpdateUserDialog } from "../ui/update-user-dialog"

const UserFormDialogModule = vi.hoisted(() => ({
    UserFormDialog: vi.fn(),
}))

vi.mock("../hooks/use-update-user-dialog", () => ({
    useUpdateUserDialog: vi.fn(),
}))

vi.mock("../ui/user-form-dialog", () => UserFormDialogModule)

describe("UpdateUserDialog Component", () => {
    const mockOnOpenChange = vi.fn()
    const mockHandleSubmit = vi.fn()
    const mockHandleChange = vi.fn()

    const sampleUser: EditableUser = {
        id: "user-1",
        email: "test@example.com",
        role: "Admin",
        profile: {
            first_name: "Alice",
            last_name: "Smith",
            avatar: null,
        },
        department: { id: "dep-1", name: "Engineering" },
        position: { id: "pos-1", name: "Developer" },
    }

    const defaultHookReturn = {
        isSubmitting: false,
        form: {
            firstName: "Alice",
            lastName: "Smith",
            departmentId: "dep-1",
            positionId: "pos-1",
            role: "ADMIN" as const,
        },
        departments: [{ id: "dep-1", name: "Engineering" }],
        positions: [{ id: "pos-1", name: "Developer" }],
        roleOptions: [{ id: "ADMIN" as const, name: "Admin" }],
        handleChange: mockHandleChange,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()

        UserFormDialogModule.UserFormDialog.mockImplementation(
            ({
                title,
                description,
                submitLabel,
                isSubmitting,
                onSubmit,
                firstName,
                lastName,
                email,
                lockCredentials,
                onFieldChange,
            }) => (
                <form onSubmit={onSubmit} data-testid="user-form-dialog">
                    <h1>{title}</h1>
                    <p>{description}</p>
                    <div data-testid="lock-credentials">
                        {String(lockCredentials)}
                    </div>
                    <div data-testid="form-email">{email}</div>
                    <input
                        data-testid="input-firstname"
                        value={firstName}
                        readOnly
                    />
                    <input
                        data-testid="input-lastname"
                        value={lastName}
                        readOnly
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {submitLabel}
                    </button>
                </form>
            ),
        )

        vi.mocked(useUpdateUserDialog).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<
                typeof useUpdateUserDialog
            >,
        )
    })

    it("renders update dialog with correct localized titles, data, and locked credentials", () => {
        render(
            <UpdateUserDialog
                user={sampleUser}
                open={true}
                onOpenChange={mockOnOpenChange}
            />,
        )

        expect(screen.getByText("updateTitle")).toBeInTheDocument()
        expect(screen.getByText("updateDescription")).toBeInTheDocument()
        expect(screen.getByTestId("form-email")).toHaveTextContent(
            "test@example.com",
        )
        expect(screen.getByTestId("input-firstname")).toHaveValue("Alice")
        expect(screen.getByTestId("input-lastname")).toHaveValue("Smith")
        expect(screen.getByTestId("lock-credentials")).toHaveTextContent("true")
        expect(
            screen.getByRole("button", { name: "update" }),
        ).toBeInTheDocument()
    })

    it("calls handleSubmit and closes dialog on successful update", async () => {
        mockHandleSubmit.mockResolvedValueOnce(true)

        render(
            <UpdateUserDialog
                user={sampleUser}
                open={true}
                onOpenChange={mockOnOpenChange}
            />,
        )

        const submitButton = screen.getByRole("button", { name: "update" })
        await userEvent.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it("does not close dialog if update fails or returns false", async () => {
        mockHandleSubmit.mockResolvedValueOnce(false)

        render(
            <UpdateUserDialog
                user={sampleUser}
                open={true}
                onOpenChange={mockOnOpenChange}
            />,
        )

        const submitButton = screen.getByRole("button", { name: "update" })
        await userEvent.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnOpenChange).not.toHaveBeenCalled()
    })

    it("ignores email and password field changes but forwards other fields", () => {
        render(
            <UpdateUserDialog
                user={sampleUser}
                open={true}
                onOpenChange={mockOnOpenChange}
            />,
        )

        const mockCalls = UserFormDialogModule.UserFormDialog.mock.calls
        expect(mockCalls.length).toBeGreaterThan(0)

        const props = mockCalls[mockCalls.length - 1][0]
        const { onFieldChange } = props

        vi.clearAllMocks()

        onFieldChange("email", "newemail@test.com")
        expect(mockHandleChange).not.toHaveBeenCalled()

        onFieldChange("password", "newpass")
        expect(mockHandleChange).not.toHaveBeenCalled()

        onFieldChange("firstName", "Bob")
        expect(mockHandleChange).toHaveBeenCalledWith("firstName", "Bob")

        onFieldChange("lastName", "Johnson")
        expect(mockHandleChange).toHaveBeenCalledWith("lastName", "Johnson")
    })
})
