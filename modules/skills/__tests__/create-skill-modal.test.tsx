import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateSkillAdminModal } from "@/modules/skills/hooks/use-create-skill-admin-modal"

import { CreateSkillModal } from "../ui/components/admin/create-skill-modal"

vi.mock("@/modules/skills/hooks/use-create-skill-admin-modal", () => ({
    useCreateSkillAdminModal: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        error,
        children,
        onSubmit,
        cancelText,
        confirmText,
    }: {
        isOpen: boolean
        title: string
        error?: string | null
        children: React.ReactNode
        onSubmit: (e: React.FormEvent) => void
        cancelText: string
        confirmText: string
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h2>{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                <form onSubmit={onSubmit}>
                    {children}
                    <button type="submit" data-testid="confirm-btn">
                        {confirmText}
                    </button>
                    <button type="button" data-testid="cancel-btn">
                        {cancelText}
                    </button>
                </form>
            </div>
        ) : null,
}))

describe("CreateSkillModal", () => {
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()
    const mockSetters = {
        setName: vi.fn(),
        setCategoryId: vi.fn(),
        handleSubmit: vi.fn((e) => e.preventDefault()),
    }

    const categories = [
        { id: "prog", name: "Programming" },
        { id: "tools", name: "Tools" },
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useCreateSkillAdminModal).mockReturnValue({
            name: "",
            setName: mockSetters.setName,
            categoryId: "",
            setCategoryId: mockSetters.setCategoryId,
            inlineError: null,
            error: null,
            isSubmitting: false,
            isValid: false,
            handleSubmit: mockSetters.handleSubmit,
        })
    })

    it("renders modal with elements when open", () => {
        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("skill")).toBeInTheDocument()
    })

    it("updates skill name on input change", () => {
        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        const input = screen.getByPlaceholderText("skill")
        fireEvent.change(input, { target: { value: "GraphQL" } })

        expect(mockSetters.setName).toHaveBeenCalledWith("GraphQL")
    })

    it("shows inline duplicate error message when inlineError is present", () => {
        vi.mocked(useCreateSkillAdminModal).mockReturnValue({
            name: "ExistingSkill",
            setName: mockSetters.setName,
            categoryId: "prog",
            setCategoryId: mockSetters.setCategoryId,
            inlineError: "duplicate",
            error: null,
            isSubmitting: false,
            isValid: false,
            handleSubmit: mockSetters.handleSubmit,
        })

        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByText("duplicate")).toBeInTheDocument()
    })

    it("triggers form submission on confirm click", () => {
        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        fireEvent.click(screen.getByTestId("confirm-btn"))
        expect(mockSetters.handleSubmit).toHaveBeenCalledTimes(1)
    })

    it("does not render anything when closed", () => {
        render(
            <CreateSkillModal
                isOpen={false}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })
})
