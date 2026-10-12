import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateCv } from "../../hooks/use-сreate-сv"
import { CreateCvModal } from "../components/create-cv-modal"

vi.mock("../../hooks/use-сreate-сv", () => ({
    useCreateCv: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        error,
        isPending,
        isValid,
        cancelText,
        confirmText,
        pendingText,
        onSubmit,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        title: string
        error?: string | null
        isPending: boolean
        isValid: boolean
        cancelText: string
        confirmText: string
        pendingText: string
        onSubmit: (e: React.SyntheticEvent) => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h1>{title}</h1>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="is-pending">{String(isPending)}</div>
                <div data-testid="is-valid">{String(isValid)}</div>
                <div>{cancelText}</div>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!isValid || isPending}
                >
                    {isPending ? pendingText : confirmText}
                </button>
                {children}
            </div>
        ) : null,
}))

vi.mock("@/components/ui/input", () => ({
    Input: ({
        label,
        value,
        onChange,
        maxLength,
    }: {
        label?: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        maxLength?: number
    }) => (
        <label>
            {label}
            <input
                type="text"
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                data-testid={`input-${label}`}
            />
        </label>
    ),
}))

vi.mock("@/components/ui/textarea", () => ({
    Textarea: ({
        value,
        onChange,
        placeholder,
    }: {
        value: string
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
        placeholder?: string
    }) => (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            data-testid="textarea-description"
        />
    ),
}))

describe("CreateCvModal", () => {
    const mockSetName = vi.fn()
    const mockSetEducation = vi.fn()
    const mockSetDescription = vi.fn()
    const mockHandleSubmit = vi.fn(async (e: React.SyntheticEvent) => {
        e.preventDefault()
    })
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()

    const defaultHookReturn = {
        name: "Test Name",
        setName: mockSetName,
        education: "Test Education",
        setEducation: mockSetEducation,
        description: "Test Description",
        setDescription: mockSetDescription,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useCreateCv).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useCreateCv>,
        )
    })

    it("renders modal with translated texts and form fields when open", () => {
        render(
            <CreateCvModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                error={null}
                isSubmitting={false}
            />,
        )

        expect(screen.getByText("createTitle")).toBeInTheDocument()
        expect(screen.getByTestId("input-name")).toHaveValue("Test Name")
        expect(screen.getByTestId("input-education")).toHaveValue(
            "Test Education",
        )
        expect(screen.getByTestId("textarea-description")).toHaveValue(
            "Test Description",
        )
        expect(
            screen.getByRole("button", { name: "create" }),
        ).toBeInTheDocument()
    })

    it("does not render modal content when isOpen is false", () => {
        render(
            <CreateCvModal
                isOpen={false}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                error={null}
                isSubmitting={false}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("displays error message when error prop is provided", () => {
        render(
            <CreateCvModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                error="Something went wrong"
                isSubmitting={false}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Something went wrong",
        )
    })

    it("displays pending state text and disables submit when isSubmitting is true", () => {
        render(
            <CreateCvModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                error={null}
                isSubmitting={true}
            />,
        )

        expect(screen.getByTestId("is-pending")).toHaveTextContent("true")
        expect(screen.getByRole("button", { name: "creating" })).toBeDisabled()
    })

    it("calls setters when user types into inputs", async () => {
        const user = userEvent.setup()

        render(
            <CreateCvModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                error={null}
                isSubmitting={false}
            />,
        )

        const nameInput = screen.getByTestId("input-name")
        await user.type(nameInput, "a")

        expect(mockSetName).toHaveBeenCalled()
    })

    it("triggers handleSubmit when form submit action is called", async () => {
        const user = userEvent.setup()

        render(
            <CreateCvModal
                isOpen={true}
                onClose={mockOnClose}
                onCreate={mockOnCreate}
                error={null}
                isSubmitting={false}
            />,
        )

        const submitButton = screen.getByRole("button", { name: "create" })
        await user.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
