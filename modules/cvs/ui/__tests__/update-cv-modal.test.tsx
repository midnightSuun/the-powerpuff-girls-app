import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { SyntheticEvent } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useUpdateCvModal } from "../../hooks/use-update-cv-modal"
import { UpdateCvModal } from "../components/update-cv-modal"

vi.mock("../../hooks/use-update-cv-modal", () => ({
    useUpdateCvModal: vi.fn(),
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
        onSubmit: (e: SyntheticEvent) => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h1 data-testid="modal-title">{title}</h1>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="is-pending">{String(isPending)}</div>
                <div data-testid="is-valid">{String(isValid)}</div>
                <div data-testid="cancel-text">{cancelText}</div>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!isValid || isPending}
                    data-testid="modal-submit"
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
        error,
    }: {
        label?: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
        error?: string
    }) => {
        const testIdKey = label?.includes("name") ? "name" : "education"
        return (
            <div>
                {label && <label>{label}</label>}
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    data-testid={`input-${testIdKey}`}
                />
                {error && (
                    <span data-testid={`error-${testIdKey}`}>{error}</span>
                )}
            </div>
        )
    },
}))

vi.mock("@/components/ui/textarea", () => ({
    Textarea: ({
        value,
        onChange,
    }: {
        value: string
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    }) => (
        <textarea
            value={value}
            onChange={onChange}
            data-testid="textarea-description"
        />
    ),
}))

describe("UpdateCvModal", () => {
    const mockCv = {
        id: "cv-1",
        name: "Senior CV",
        education: "BSUIR",
        description: "Fullstack Dev",
    }

    const mockSetName = vi.fn()
    const mockSetEducation = vi.fn()
    const mockSetDescription = vi.fn()
    const mockHandleSubmit = vi.fn(async (e: SyntheticEvent) => {
        e.preventDefault()
    })
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const defaultHookReturn = {
        name: "Senior CV",
        setName: mockSetName,
        education: "BSUIR",
        setEducation: mockSetEducation,
        description: "Fullstack Dev",
        setDescription: mockSetDescription,
        hasSubmitted: false,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useUpdateCvModal).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useUpdateCvModal>,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders modal with fields and values when open", () => {
        render(
            <UpdateCvModal
                isOpen={true}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                isSubmitting={false}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
            "updateTitle",
        )
        expect(screen.getByTestId("input-name")).toHaveValue("Senior CV")
        expect(screen.getByTestId("input-education")).toHaveValue("BSUIR")
        expect(screen.getByTestId("textarea-description")).toHaveValue(
            "Fullstack Dev",
        )
        expect(screen.getByTestId("modal-submit")).toHaveTextContent("save")
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <UpdateCvModal
                isOpen={false}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                isSubmitting={false}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("displays error banner when error prop is provided", () => {
        render(
            <UpdateCvModal
                isOpen={true}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                error="Update failed on server"
                isSubmitting={false}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Update failed on server",
        )
    })

    it("displays saving state and disables submit when isSubmitting is true", () => {
        render(
            <UpdateCvModal
                isOpen={true}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                isSubmitting={true}
            />,
        )

        expect(screen.getByTestId("is-pending")).toHaveTextContent("true")
        expect(screen.getByTestId("modal-submit")).toHaveTextContent("saving")
    })

    it("shows validation error messages when hasSubmitted is true and fields are empty", () => {
        vi.mocked(useUpdateCvModal).mockReturnValue({
            ...defaultHookReturn,
            name: "",
            education: "",
            description: "",
            hasSubmitted: true,
            isValid: false,
        } as unknown as ReturnType<typeof useUpdateCvModal>)

        render(
            <UpdateCvModal
                isOpen={true}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                isSubmitting={false}
            />,
        )

        expect(screen.getByTestId("error-name")).toHaveTextContent(
            "nameRequired",
        )
        expect(screen.getByTestId("error-education")).toHaveTextContent(
            "educationRequired",
        )
        expect(screen.getByText("descriptionRequired")).toBeInTheDocument()
    })

    it("calls setters when user types in inputs", async () => {
        const user = userEvent.setup()

        render(
            <UpdateCvModal
                isOpen={true}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                isSubmitting={false}
            />,
        )

        const nameInput = screen.getByTestId("input-name")
        await user.clear(nameInput)
        await user.type(nameInput, "New Name")
        expect(mockSetName).toHaveBeenCalled()

        const educationInput = screen.getByTestId("input-education")
        await user.clear(educationInput)
        await user.type(educationInput, "New University")
        expect(mockSetEducation).toHaveBeenCalled()

        const descriptionTextarea = screen.getByTestId("textarea-description")
        await user.clear(descriptionTextarea)
        await user.type(descriptionTextarea, "New Description")
        expect(mockSetDescription).toHaveBeenCalled()
    })

    it("triggers handleSubmit when submit button is clicked", async () => {
        const user = userEvent.setup()

        render(
            <UpdateCvModal
                isOpen={true}
                onClose={mockOnClose}
                cv={mockCv}
                onUpdate={mockOnUpdate}
                isSubmitting={false}
            />,
        )

        const submitButton = screen.getByTestId("modal-submit")
        await user.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
