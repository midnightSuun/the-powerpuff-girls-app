import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteSkillsButton } from "@/modules/skills/hooks/use-delete-skills-button"

import { DeleteSkillsButton } from "../ui/components/user/delete-skill-button"

vi.mock("@/modules/skills/hooks/use-delete-skills-button", () => ({
    useDeleteSkillsButton: vi.fn(),
}))

vi.mock("../ui/components/user/delete-skill-modal", () => ({
    DeleteSkillsModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? (
            <div data-testid="delete-skills-modal">Delete Modal</div>
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
    }: {
        children: React.ReactNode
        onClick: () => void
        disabled?: boolean
    }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}))

describe("DeleteSkillsButton", () => {
    const mockOnToggleSelectionMode = vi.fn()
    const mockOnClearSelection = vi.fn()
    const mockSetIsModalOpen = vi.fn()
    const mockHandleCancel = vi.fn()
    const mockHandleDeleteConfirm = vi.fn(async () => {})

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

        vi.mocked(useDeleteSkillsButton).mockReturnValue({
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useDeleteSkillsButton
            >["t"],
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

        const btn = screen.getByTestId("remove-items-btn")
        expect(btn).toBeInTheDocument()
        expect(btn).toHaveTextContent("remove")
    })

    it("toggles selection mode when RemoveItemsButton is clicked", () => {
        render(<DeleteSkillsButton {...defaultProps} />)

        fireEvent.click(screen.getByTestId("remove-items-btn"))
        expect(mockOnToggleSelectionMode).toHaveBeenCalledWith(true)
    })

    it("renders selection mode buttons when isSelectionMode is true", () => {
        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["s-1"]}
            />,
        )

        expect(screen.getByText("cancel")).toBeInTheDocument()
        expect(screen.getByText("deleteSelected")).toBeInTheDocument()
    })

    it("opens delete modal when delete selected action is triggered", () => {
        vi.mocked(useDeleteSkillsButton).mockReturnValue({
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useDeleteSkillsButton
            >["t"],
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
                selectedSkills={["s-1"]}
            />,
        )

        expect(screen.getByTestId("delete-skills-modal")).toBeInTheDocument()
    })

    it("triggers handleCancel when cancel button is clicked in selection mode", () => {
        render(
            <DeleteSkillsButton
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["s-1"]}
            />,
        )

        fireEvent.click(screen.getByText("cancel"))
        expect(mockHandleCancel).toHaveBeenCalledTimes(1)
    })
})
