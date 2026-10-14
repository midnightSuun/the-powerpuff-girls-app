import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useHeaderToolbarAction } from "@/components/header-toolbar-action"

import { useCreateUserDialog } from "../hooks/use-create-user-dialog"
import { CreateUserDialog } from "../ui/create-user-dialog"

vi.mock("@/components/header-toolbar-action", () => ({
    useHeaderToolbarAction: vi.fn(),
}))

vi.mock("../hooks/use-create-user-dialog", () => ({
    useCreateUserDialog: vi.fn(),
}))

describe("CreateUserDialog Component", () => {
    const mockHandleOpenChange = vi.fn()
    const mockHandleChange = vi.fn()
    const mockHandleSubmit = vi.fn((e) => {
        if ("preventDefault" in e) {
            e.preventDefault()
        }
    })

    const defaultHookReturn = {
        isOpen: false,
        isSubmitting: false,
        form: {
            email: "test@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
            departmentId: "dep-1",
            positionId: "pos-1",
            role: "Employee" as const,
        },
        departments: [{ id: "dep-1", name: "Engineering" }],
        positions: [{ id: "pos-1", name: "Developer" }],
        roleOptions: [{ id: "Employee" as const, name: "Employee" }],
        handleOpenChange: mockHandleOpenChange,
        handleChange: mockHandleChange,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useCreateUserDialog).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<
                typeof useCreateUserDialog
            >,
        )
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("registers header toolbar action with correct title and opens dialog on trigger", () => {
        render(<CreateUserDialog />)

        expect(useHeaderToolbarAction).toHaveBeenCalledTimes(1)
        expect(useHeaderToolbarAction).toHaveBeenCalledWith(
            "createUser",
            expect.any(Function),
        )

        const toolbarCallback = vi.mocked(useHeaderToolbarAction).mock
            .calls[0][1]

        toolbarCallback()
        expect(mockHandleOpenChange).toHaveBeenCalledWith(true)
    })

    it("renders UserFormDialog elements correctly with translations", () => {
        vi.mocked(useCreateUserDialog).mockReturnValue({
            ...defaultHookReturn,
            isOpen: true,
        } as unknown as ReturnType<typeof useCreateUserDialog>)

        render(<CreateUserDialog />)

        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText("createUser")).toBeInTheDocument()
        expect(screen.getByText("description")).toBeInTheDocument()
    })

    it("passes form values and triggers submit handler correctly", async () => {
        vi.mocked(useCreateUserDialog).mockReturnValue({
            ...defaultHookReturn,
            isOpen: true,
            isSubmitting: false,
        } as unknown as ReturnType<typeof useCreateUserDialog>)

        render(<CreateUserDialog />)

        expect(screen.getByRole("dialog")).toBeInTheDocument()

        const submitButton = screen.getByRole("button", { name: /submit/i })
        await userEvent.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
