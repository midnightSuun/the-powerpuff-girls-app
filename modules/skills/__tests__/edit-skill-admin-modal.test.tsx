import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useEditSkillAdminModal } from "@/modules/skills/hooks/use-edit-skill-admin-modal"

import { EditSkillModal } from "../ui/components/admin/edit-skill-admin-modal"

vi.mock("@/modules/skills/hooks/use-edit-skill-admin-modal", () => ({
    useEditSkillAdminModal: vi.fn(),
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
                    <button type="submit" data-testid="save-btn">
                        {confirmText}
                    </button>
                    <button type="button" data-testid="cancel-btn">
                        {cancelText}
                    </button>
                </form>
            </div>
        ) : null,
}))

describe("EditSkillModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()
    const mockSetters = {
        setName: vi.fn(),
        setCategoryId: vi.fn(),
        handleSubmit: vi.fn((e) => e.preventDefault()),
    }

    const sampleSkill = {
        id: "1",
        name: "TypeScript",
        category: "Programming",
        categoryId: "prog",
    }

    const categories = [
        { id: "prog", name: "Programming" },
        { id: "tools", name: "Tools" },
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useEditSkillAdminModal).mockReturnValue({
            name: "TypeScript",
            setName: mockSetters.setName,
            categoryId: "prog",
            setCategoryId: mockSetters.setCategoryId,
            error: null,
            isSubmitting: false,
            isValid: true,
            handleSubmit: mockSetters.handleSubmit,
        })
    })

    it("renders modal with pre-filled skill values when open", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        const input = screen.getByPlaceholderText("skill") as HTMLInputElement
        expect(input.value).toBe("TypeScript")
    })

    it("updates skill name on input change", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        const input = screen.getByPlaceholderText("skill")
        fireEvent.change(input, { target: { value: "TypeScript Advanced" } })

        expect(mockSetters.setName).toHaveBeenCalledWith("TypeScript Advanced")
    })

    it("triggers form submission on save click", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        fireEvent.click(screen.getByTestId("save-btn"))
        expect(mockSetters.handleSubmit).toHaveBeenCalledTimes(1)
    })

    it("does not render anything when closed", () => {
        render(
            <EditSkillModal
                isOpen={false}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })
})
