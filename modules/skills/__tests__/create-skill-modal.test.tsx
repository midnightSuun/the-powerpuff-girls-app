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
                    <button type="submit" data-testid="confirm-btn">
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
                onClick={() => onValueChange?.("prog")}
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
        onClick,
    }: {
        children: React.ReactNode
        value: string
        onClick?: () => void
    }) => (
        <div data-testid={`select-item-${value}`} onClick={onClick}>
            {children}
        </div>
    ),
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

    it("renders with empty categoryId showing placeholder in SelectValue", () => {
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

        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
    })

    it("filters out duplicate category names (same id → same translation key)", () => {
        const duplicateCategories = [
            { id: "prog", name: "Programming" },
            { id: "prog", name: "Programming Duplicate" },
        ]

        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={duplicateCategories}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getAllByTestId("select-item-prog")).toHaveLength(1)
    })

    it("calls setCategoryId when Select value changes", () => {
        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        fireEvent.click(screen.getByTestId("select-trigger"))
        expect(mockSetters.setCategoryId).toHaveBeenCalledWith("prog")
    })

    it("calls setCategoryId with empty string when onValueChange receives undefined (val ?? '')", () => {
        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                onCreate={mockOnCreate}
            />,
        )

        fireEvent.click(screen.getByTestId("select-trigger-null"))
        expect(mockSetters.setCategoryId).toHaveBeenCalledWith("")
    })

    it("handles CategoryOption with empty id", () => {
        const emptyIdCategories = [
            { id: "", name: "Unknown" },
            { id: "prog", name: "Programming" },
        ]

        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={emptyIdCategories}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
    })

    it("displays modal error when error state is present", () => {
        vi.mocked(useCreateSkillAdminModal).mockReturnValue({
            name: "TestSkill",
            setName: mockSetters.setName,
            categoryId: "prog",
            setCategoryId: mockSetters.setCategoryId,
            inlineError: null,
            error: "Failed to create skill",
            isSubmitting: false,
            isValid: true,
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

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to create skill",
        )
    })

    it("disables input when isSubmitting is true", () => {
        vi.mocked(useCreateSkillAdminModal).mockReturnValue({
            name: "",
            setName: mockSetters.setName,
            categoryId: "",
            setCategoryId: mockSetters.setCategoryId,
            inlineError: null,
            error: null,
            isSubmitting: true,
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

        const inputs = screen.getAllByPlaceholderText("skill")
        inputs.forEach((input) => {
            expect(input).toBeDisabled()
        })
    })

    it("passes existingSkillNames to the hook", () => {
        const existingNames = ["TypeScript", "Python"]

        render(
            <CreateSkillModal
                isOpen={true}
                onClose={mockOnClose}
                categories={categories}
                existingSkillNames={existingNames}
                onCreate={mockOnCreate}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
    })
})
