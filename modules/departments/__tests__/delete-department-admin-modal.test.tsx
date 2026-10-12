import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteDepartmentModal } from "@/modules/departments/hooks/use-delete-department-modal"

import { DeleteDepartmentModal } from "../ui/components/delete-department-admin-modal"

vi.mock("@/modules/departments/hooks/use-delete-department-modal", () => ({
    useDeleteDepartmentModal: vi.fn(),
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        description,
        error,
        isDeleting,
        cancelText,
        confirmText,
        deletingText,
        onConfirm,
    }: {
        isOpen: boolean
        onClose: () => void
        title: string
        description: string
        error?: string | null
        isDeleting: boolean
        cancelText: string
        confirmText: string
        deletingText: string
        onConfirm: () => void
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h1>{title}</h1>
                <p>{description} Engineering</p>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="is-deleting">{String(isDeleting)}</div>
                <div>{cancelText}</div>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    data-testid="confirm-delete-button"
                >
                    {isDeleting ? deletingText : confirmText}
                </button>
            </div>
        ) : null,
}))

describe("DeleteDepartmentModal", () => {
    const mockHandleConfirm = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnConfirmProp = vi.fn()

    const defaultHookReturn = {
        isDeleting: false,
        error: null,
        handleConfirm: mockHandleConfirm,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useDeleteDepartmentModal).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<
                typeof useDeleteDepartmentModal
            >,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders modal with formatted department name description when open", () => {
        render(
            <DeleteDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                departmentName="Engineering"
                onConfirm={mockOnConfirmProp}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByText(/Engineering/)).toBeInTheDocument()
        expect(screen.getByTestId("confirm-delete-button")).toHaveTextContent(
            "confirm",
        )
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <DeleteDepartmentModal
                isOpen={false}
                onClose={mockOnClose}
                departmentName="Engineering"
                onConfirm={mockOnConfirmProp}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("displays error message when error state is present", () => {
        vi.mocked(useDeleteDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            error: "Department is currently in use",
        } as unknown as ReturnType<typeof useDeleteDepartmentModal>)

        render(
            <DeleteDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                departmentName="Engineering"
                onConfirm={mockOnConfirmProp}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Department is currently in use",
        )
    })

    it("shows deleting state text and disables button when isDeleting is true", () => {
        vi.mocked(useDeleteDepartmentModal).mockReturnValue({
            ...defaultHookReturn,
            isDeleting: true,
        } as unknown as ReturnType<typeof useDeleteDepartmentModal>)

        render(
            <DeleteDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                departmentName="Engineering"
                onConfirm={mockOnConfirmProp}
            />,
        )

        expect(screen.getByTestId("is-deleting")).toHaveTextContent("true")
        expect(screen.getByTestId("confirm-delete-button")).toHaveTextContent(
            "deleting",
        )
        expect(screen.getByTestId("confirm-delete-button")).toBeDisabled()
    })

    it("triggers handleConfirm when confirmation button is clicked", async () => {
        const user = userEvent.setup()
        render(
            <DeleteDepartmentModal
                isOpen={true}
                onClose={mockOnClose}
                departmentName="Engineering"
                onConfirm={mockOnConfirmProp}
            />,
        )

        const confirmButton = screen.getByTestId("confirm-delete-button")
        await user.click(confirmButton)

        expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })
})
