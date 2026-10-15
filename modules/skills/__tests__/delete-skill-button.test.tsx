import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DeleteSkillsButton } from "../ui/components/user/delete-skill-button"

const { mockUseDeleteSkillsButton } = vi.hoisted(() => ({
    mockUseDeleteSkillsButton: vi.fn(),
}))

vi.mock("@/modules/skills/hooks/use-delete-skills-button", () => ({
    useDeleteSkillsButton: mockUseDeleteSkillsButton,
}))

vi.mock("../ui/components/user/delete-skill-modal", () => ({
    DeleteSkillsModal: ({
        isOpen,
        onClose,
        onConfirm,
    }: {
        isOpen: boolean
        onClose: () => void
        onConfirm: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-skills-modal">
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                <button data-testid="modal-confirm" onClick={onConfirm}>
                    Confirm
                </button>
            </div>
        ) : null,
}))

vi.mock("@/components/ui/list-management-buttons", () => ({
    RemoveItemsButton: ({
        label,
        onClick,
        disabled,
    }: {
        label: string
        onClick: () => void
        disabled: boolean
    }) => (
        <button
            data-testid="remove-items-btn"
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    ),
}))

vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        onClick,
        disabled,
        variant,
        type,
    }: {
        children: React.ReactNode
        onClick?: () => void
        disabled?: boolean
        variant?: string
        type?: string
    }) => (
        <button
            data-testid={`button-${variant || "default"}`}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </button>
    ),
}))

describe("DeleteSkillsButton", () => {
    const mockSetIsModalOpen = vi.fn()
    const mockHandleDeleteConfirm = vi.fn(async () => {})
    const mockHandleCancel = vi.fn()
    const mockOnToggleSelectionMode = vi.fn()
    const mockOnClearSelection = vi.fn()

    const defaultProps = {
        cvId: "cv-1",
        selectedSkills: [],
        isSelectionMode: false,
        onToggleSelectionMode: mockOnToggleSelectionMode,
        onClearSelection: mockOnClearSelection,
        disabled: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()

        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string, params?: { count?: number }) => {
                if (key === "deleteSelected") {
                    return `Delete ${params?.count || 0}`
                }
                return key
            },
            isModalOpen: false,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: false,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })
    })

    it("renders RemoveItemsButton when not in selection mode", () => {
        render(<DeleteSkillsButton {...defaultProps} />)

        const button = screen.getByTestId("remove-items-btn")
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent("remove")
    })

    it("calls onToggleSelectionMode when RemoveItemsButton is clicked", () => {
        render(<DeleteSkillsButton {...defaultProps} />)

        fireEvent.click(screen.getByTestId("remove-items-btn"))
        expect(mockOnToggleSelectionMode).toHaveBeenCalledWith(true)
    })

    it("disables RemoveItemsButton when disabled prop is true", () => {
        render(<DeleteSkillsButton {...defaultProps} disabled={true} />)

        const button = screen.getByTestId("remove-items-btn")
        expect(button).toBeDisabled()
    })

    it("renders cancel and delete buttons when in selection mode", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string, params?: { count?: number }) => {
                if (key === "deleteSelected") {
                    return `Delete ${params?.count || 0}`
                }
                return key
            },
            isModalOpen: false,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1", "skill-2"]}
            />,
        )

        expect(screen.getByTestId("button-ghost")).toBeInTheDocument()
        expect(screen.getByTestId("button-ghost")).toHaveTextContent("cancel")
        expect(screen.getByTestId("button-primary")).toBeInTheDocument()
        expect(screen.getByTestId("button-primary")).toHaveTextContent(
            "Delete 2",
        )
    })

    it("calls handleCancel when cancel button is clicked", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string) => key,
            isModalOpen: false,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1"]}
            />,
        )

        fireEvent.click(screen.getByTestId("button-ghost"))
        expect(mockHandleCancel).toHaveBeenCalledTimes(1)
    })

    it("opens modal when delete button is clicked and has selected skills", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string, params?: { count?: number }) => {
                if (key === "deleteSelected") {
                    return `Delete ${params?.count || 0}`
                }
                return key
            },
            isModalOpen: false,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1"]}
            />,
        )

        fireEvent.click(screen.getByTestId("button-primary"))
        expect(mockSetIsModalOpen).toHaveBeenCalledWith(true)
    })

    it("disables delete button when no skills are selected", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string, params?: { count?: number }) => {
                if (key === "deleteSelected") {
                    return `Delete ${params?.count || 0}`
                }
                return key
            },
            isModalOpen: false,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: false,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={[]}
            />,
        )

        const deleteButton = screen.getByTestId("button-primary")
        expect(deleteButton).toBeDisabled()
    })

    it("disables buttons when isSubmitting is true", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string) => key,
            isModalOpen: false,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: true,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1"]}
            />,
        )

        expect(screen.getByTestId("button-ghost")).toBeDisabled()
        expect(screen.getByTestId("button-primary")).toBeDisabled()
    })

    it("renders DeleteSkillsModal when isModalOpen is true", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string) => key,
            isModalOpen: true,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1"]}
            />,
        )

        expect(screen.getByTestId("delete-skills-modal")).toBeInTheDocument()
    })

    it("closes modal when modal close button is clicked", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string) => key,
            isModalOpen: true,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1"]}
            />,
        )

        fireEvent.click(screen.getByTestId("modal-close"))
        expect(mockSetIsModalOpen).toHaveBeenCalledWith(false)
    })

    it("calls handleDeleteConfirm when modal confirm button is clicked", () => {
        mockUseDeleteSkillsButton.mockReturnValue({
            t: (key: string) => key,
            isModalOpen: true,
            setIsModalOpen: mockSetIsModalOpen,
            isSubmitting: false,
            hasSelected: true,
            handleDeleteConfirm: mockHandleDeleteConfirm,
            handleCancel: mockHandleCancel,
        })

        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["skill-1"]}
            />,
        )

        fireEvent.click(screen.getByTestId("modal-confirm"))
        expect(mockHandleDeleteConfirm).toHaveBeenCalledTimes(1)
    })
})
