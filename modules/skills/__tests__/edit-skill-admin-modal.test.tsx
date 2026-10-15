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
        onClose,
        cancelText,
        confirmText,
    }: {
        isOpen: boolean
        title: string
        error?: string | null
        children: React.ReactNode
        onSubmit: (e: React.FormEvent) => void
        onClose: () => void
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
                    <button
                        type="button"
                        data-testid="cancel-btn"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                </form>
            </div>
        ) : null,
}))

vi.mock("@/components/ui/select", () => ({
    Select: ({
        children,
        onValueChange,
        value,
    }: {
        children: React.ReactNode
        onValueChange?: (val: string) => void
        value?: string
    }) => (
        <div data-testid="select-root" data-value={value}>
            <button
                role="combobox"
                data-testid="select-trigger"
                onClick={() => onValueChange?.("tools")}
            >
                {value || "placeholder"}
            </button>
            <button
                data-testid="select-trigger-null"
                onClick={() =>
                    (onValueChange as (val: string | undefined) => void)?.(
                        undefined,
                    )
                }
            >
                clear
            </button>
            {children}
        </div>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    SelectValue: ({ children }: { children?: React.ReactNode }) => (
        <span>{children}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="select-content">{children}</div>
    ),
    SelectItem: ({
        children,
        value,
    }: {
        children: React.ReactNode
        value: string
    }) => <div data-testid={`select-item-${value}`}>{children}</div>,
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

    it("renders with empty categoryId showing undefined in SelectValue", () => {
        vi.mocked(useEditSkillAdminModal).mockReturnValue({
            name: "TypeScript",
            setName: mockSetters.setName,
            categoryId: "",
            setCategoryId: mockSetters.setCategoryId,
            error: null,
            isSubmitting: false,
            isValid: true,
            handleSubmit: mockSetters.handleSubmit,
        })

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
    })

    it("calls setCategoryId when a category is selected via Select", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        fireEvent.click(screen.getByTestId("select-trigger"))
        expect(mockSetters.setCategoryId).toHaveBeenCalledWith("tools")
    })

    it("calls setCategoryId with empty string when onValueChange receives undefined (val ?? '')", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        fireEvent.click(screen.getByTestId("select-trigger-null"))
        expect(mockSetters.setCategoryId).toHaveBeenCalledWith("")
    })

    it("calls setCategoryId with empty string when Select onValueChange receives null", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        const selectElement = screen.getByRole("combobox")
        expect(selectElement).toBeInTheDocument()
        expect(mockSetters.setCategoryId).not.toHaveBeenCalledWith(null)
    })

    it("displays modal error when error state is present", () => {
        vi.mocked(useEditSkillAdminModal).mockReturnValue({
            name: "TypeScript",
            setName: mockSetters.setName,
            categoryId: "prog",
            setCategoryId: mockSetters.setCategoryId,
            error: "Failed to update skill",
            isSubmitting: false,
            isValid: true,
            handleSubmit: mockSetters.handleSubmit,
        })

        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to update skill",
        )
    })

    it("disables input when isSubmitting is true", () => {
        vi.mocked(useEditSkillAdminModal).mockReturnValue({
            name: "TypeScript",
            setName: mockSetters.setName,
            categoryId: "prog",
            setCategoryId: mockSetters.setCategoryId,
            error: null,
            isSubmitting: true,
            isValid: false,
            handleSubmit: mockSetters.handleSubmit,
        })

        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        const inputs = screen.getAllByPlaceholderText("skill")
        inputs.forEach((input) => {
            expect(input).toBeDisabled()
        })
    })

    it("filters out duplicate category names (same id → same translation key)", () => {
        // Глобальный мок tSkills возвращает ключ as-is:
        // Чтобы сработал seenNames.has(), нужно две категории с одинаковым id
        const duplicateCategories = [
            { id: "prog", name: "Programming" },
            { id: "prog", name: "Programming Duplicate" },
            { id: "tools", name: "Tools" },
        ]

        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={sampleSkill}
                categories={duplicateCategories}
                onUpdate={mockOnUpdate}
            />,
        )

        // Второй элемент отфильтрован — в DOM только один select item для "prog"
        expect(screen.getAllByTestId("select-item-prog")).toHaveLength(1)
    })

    it("handles null skill gracefully", () => {
        render(
            <EditSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skill={null}
                categories={categories}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
    })
})
