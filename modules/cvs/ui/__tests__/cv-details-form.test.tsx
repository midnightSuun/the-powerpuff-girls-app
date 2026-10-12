import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { SyntheticEvent } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCvDetailsForm } from "../../hooks/use-cv-details-form"
import type { CvItem } from "../../types"
import { CvDetailsForm } from "../components/cv-details-form"

vi.mock("../../hooks/use-cv-details-form", () => ({
    useCvDetailsForm: vi.fn(),
}))

vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        type,
        disabled,
        className,
        onClick,
    }: {
        children: React.ReactNode
        type?: "button" | "submit" | "reset"
        disabled?: boolean
        className?: string
        onClick?: () => void
    }) => (
        <button
            type={type ?? "button"}
            disabled={disabled}
            className={className}
            onClick={onClick}
            data-testid="submit-button"
        >
            {children}
        </button>
    ),
}))

vi.mock("@/components/ui/input", () => ({
    Input: ({
        id,
        label,
        value,
        onChange,
    }: {
        id?: string
        label?: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    }) => (
        <div>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                type="text"
                value={value}
                onChange={onChange}
                data-testid={`input-${id}`}
            />
        </div>
    ),
}))

vi.mock("@/components/ui/textarea", () => ({
    Textarea: ({
        id,
        value,
        onChange,
    }: {
        id?: string
        value: string
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    }) => (
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            data-testid={`textarea-${id}`}
        />
    ),
}))

describe("CvDetailsForm", () => {
    const mockCv: CvItem = {
        id: "cv-1",
        name: "John Doe",
        education: "MIT",
        description: "Software Engineer",
        projects: [],
        skills: [],
        languages: [],
    }

    const mockSetName = vi.fn()
    const mockSetEducation = vi.fn()
    const mockSetDescription = vi.fn()
    const mockHandleSubmit = vi.fn(async (e: SyntheticEvent) => {
        e.preventDefault()
    })
    const mockOnUpdate = vi.fn()

    const defaultHookReturn = {
        name: "John Doe",
        setName: mockSetName,
        education: "MIT",
        setEducation: mockSetEducation,
        description: "Software Engineer",
        setDescription: mockSetDescription,
        isSubmitting: false,
        error: null,
        isDirty: false,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCvDetailsForm).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useCvDetailsForm>,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders form fields with correct initial values from hook", () => {
        render(<CvDetailsForm cv={mockCv} onUpdate={mockOnUpdate} />)

        expect(screen.getByTestId("input-cv-name")).toHaveValue("John Doe")
        expect(screen.getByTestId("input-cv-education")).toHaveValue("MIT")
        expect(screen.getByTestId("textarea-cv-description")).toHaveValue(
            "Software Engineer",
        )
        expect(screen.getByTestId("submit-button")).toBeDisabled()
        expect(screen.getByTestId("submit-button")).toHaveTextContent("update")
    })

    it("displays error message when error state is present", () => {
        vi.mocked(useCvDetailsForm).mockReturnValue({
            ...defaultHookReturn,
            error: "Update failed",
        } as unknown as ReturnType<typeof useCvDetailsForm>)

        render(<CvDetailsForm cv={mockCv} onUpdate={mockOnUpdate} />)

        expect(screen.getByText("Update failed")).toBeInTheDocument()
    })

    it("enables submit button when form is dirty and not submitting", () => {
        vi.mocked(useCvDetailsForm).mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
        } as unknown as ReturnType<typeof useCvDetailsForm>)

        render(<CvDetailsForm cv={mockCv} onUpdate={mockOnUpdate} />)

        expect(screen.getByTestId("submit-button")).not.toBeDisabled()
    })

    it("shows updating state text and disables submit when isSubmitting is true", () => {
        vi.mocked(useCvDetailsForm).mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
            isSubmitting: true,
        } as unknown as ReturnType<typeof useCvDetailsForm>)

        render(<CvDetailsForm cv={mockCv} onUpdate={mockOnUpdate} />)

        expect(screen.getByTestId("submit-button")).toBeDisabled()
        expect(screen.getByTestId("submit-button")).toHaveTextContent(
            "updating",
        )
    })

    it("calls setters when user updates input fields", async () => {
        const user = userEvent.setup()

        render(<CvDetailsForm cv={mockCv} onUpdate={mockOnUpdate} />)

        const nameInput = screen.getByTestId("input-cv-name")
        await user.clear(nameInput)
        await user.type(nameInput, "Jane")

        expect(mockSetName).toHaveBeenCalled()
    })

    it("calls handleSubmit when the form is submitted", async () => {
        const user = userEvent.setup()

        vi.mocked(useCvDetailsForm).mockReturnValue({
            ...defaultHookReturn,
            isDirty: true,
        } as unknown as ReturnType<typeof useCvDetailsForm>)

        render(<CvDetailsForm cv={mockCv} onUpdate={mockOnUpdate} />)

        const submitButton = screen.getByTestId("submit-button")
        await user.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
