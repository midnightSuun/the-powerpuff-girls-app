import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { SyntheticEvent } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { ProjectOption } from "@/modules/cvs/types"

import { useCvProjectForm } from "../../hooks/use-cv-project-form"
import { CvProjectFormModal } from "../components/cv-project-form-modal"

vi.mock("../../hooks/use-cv-project-form", () => ({
    useCvProjectForm: vi.fn(),
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
                <h1>{title}</h1>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="is-pending">{String(isPending)}</div>
                <div data-testid="is-valid">{String(isValid)}</div>
                <div>{cancelText}</div>
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

vi.mock("@/components/ui/select", () => ({
    Select: ({
        value,
        onValueChange,
        children,
    }: {
        value: string
        onValueChange: (val: string) => void
        children: React.ReactNode
    }) => (
        <div data-testid="select-project">
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                data-testid="native-select"
            >
                {children}
            </select>
        </div>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    SelectItem: ({
        value,
        children,
    }: {
        value: string
        children: React.ReactNode
    }) => <option value={value}>{children}</option>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    SelectValue: () => <span>Select Project</span>,
}))

vi.mock("@/components/ui/date-picker", () => ({
    DatePicker: ({
        value,
        onChange,
        placeholder,
    }: {
        value: string
        onChange: (val: string) => void
        placeholder?: string
    }) => (
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            data-testid={`datepicker-${placeholder}`}
        />
    ),
}))

vi.mock("@/components/ui/input", () => ({
    Input: ({
        value,
        onChange,
        placeholder,
        readOnly,
    }: {
        value: string
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
        placeholder?: string
        readOnly?: boolean
    }) => (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            data-testid={readOnly ? "input-domain" : "input-roles"}
        />
    ),
}))

vi.mock("@/components/ui/textarea", () => ({
    Textarea: ({
        value,
        onChange,
        readOnly,
    }: {
        value: string
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
        readOnly?: boolean
    }) => (
        <textarea
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            data-testid={
                readOnly ? "textarea-project-desc" : "textarea-responsibilities"
            }
        />
    ),
}))

describe("CvProjectFormModal", () => {
    const mockProjects: ProjectOption[] = [
        {
            id: "p-1",
            name: "Project Alpha",
            internal_name: "Alpha",
            description: "Alpha desc",
            domain: "Fintech",
            environment: ["React", "TypeScript"],
        },
    ]

    const mockSetProjectId = vi.fn()
    const mockSetStartDate = vi.fn()
    const mockSetEndDate = vi.fn()
    const mockSetRoles = vi.fn()
    const mockSetResponsibilities = vi.fn()
    const mockHandleSubmit = vi.fn(async (e: SyntheticEvent) => {
        e.preventDefault()
    })
    const mockOnClose = vi.fn()
    const mockOnSaved = vi.fn()

    const defaultHookReturn = {
        t: (key: string) => key,
        projectId: "p-1",
        setProjectId: mockSetProjectId,
        startDate: "2026-01-01",
        setStartDate: mockSetStartDate,
        endDate: "2026-06-01",
        setEndDate: mockSetEndDate,
        roles: "Developer",
        setRoles: mockSetRoles,
        responsibilities: "Coding",
        setResponsibilities: mockSetResponsibilities,
        error: null,
        isSubmitting: false,
        availableProjects: mockProjects,
        selectedProject: mockProjects[0],
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
        vi.mocked(useCvProjectForm).mockReturnValue(
            defaultHookReturn as unknown as ReturnType<typeof useCvProjectForm>,
        )
    })

    afterEach(() => {
        cleanup()
    })

    it("renders modal with add title and form elements when open", () => {
        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        expect(screen.getByText("addTitle")).toBeInTheDocument()
        expect(screen.getByTestId("modal-submit")).toHaveTextContent("add")
        expect(screen.getByTestId("input-domain")).toHaveValue("Fintech")
    })

    it("renders modal with edit title when project is provided", () => {
        const existingProjectItem = {
            id: "proj-item-1",
            project: { id: "p-1", name: "Project Alpha" },
            name: "Project Alpha",
            internal_name: "Alpha",
            description: "Desc",
            domain: "Fintech",
            start_date: "2026-01-01",
            end_date: null,
            roles: ["Developer"],
            responsibilities: ["Coding"],
            environment: ["React"],
        }

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                project={existingProjectItem}
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        expect(screen.getByText("editTitle")).toBeInTheDocument()
        expect(screen.getByTestId("modal-submit")).toHaveTextContent("update")
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <CvProjectFormModal
                isOpen={false}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("displays error message when error state is present", () => {
        vi.mocked(useCvProjectForm).mockReturnValue({
            ...defaultHookReturn,
            error: "Failed to save project",
        } as unknown as ReturnType<typeof useCvProjectForm>)

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to save project",
        )
    })

    it("calls setters when user types in roles or responsibilities", async () => {
        const user = userEvent.setup()

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const rolesInput = screen.getByTestId("input-roles")
        await user.clear(rolesInput)
        await user.type(rolesInput, "Lead")

        expect(mockSetRoles).toHaveBeenCalled()
    })

    it("handles project selection change from the select component", async () => {
        const user = userEvent.setup()

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const nativeSelect = screen.getByTestId("native-select")
        await user.selectOptions(nativeSelect, "p-1")

        expect(mockSetProjectId).toHaveBeenCalledWith("p-1")
    })

    it("triggers date change setters for start and end dates", () => {
        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const startDatePicker = screen.getByTestId("datepicker-startDate")
        fireEvent.change(startDatePicker, { target: { value: "2026-02-01" } })
        expect(mockSetStartDate).toHaveBeenCalledWith("2026-02-01")

        const endDatePicker = screen.getByTestId("datepicker-endDate")
        fireEvent.change(endDatePicker, { target: { value: "2026-05-01" } })
        expect(mockSetEndDate).toHaveBeenCalledWith("2026-05-01")
    })

    it("triggers handleSubmit when submit button is clicked", async () => {
        const user = userEvent.setup()

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const submitButton = screen.getByTestId("modal-submit")
        await user.click(submitButton)

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it("resets end date when start date is set to a value later than end date", () => {
        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const startDatePicker = screen.getByTestId("datepicker-startDate")
        fireEvent.change(startDatePicker, { target: { value: "2026-08-01" } })

        expect(mockSetStartDate).toHaveBeenCalledWith("2026-08-01")
        expect(mockSetEndDate).toHaveBeenCalledWith("")
    })

    it("does not reset end date when start date is earlier than end date or when end date is empty", () => {
        vi.mocked(useCvProjectForm).mockReturnValue({
            ...defaultHookReturn,
            endDate: "",
        } as unknown as ReturnType<typeof useCvProjectForm>)

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const startDatePicker = screen.getByTestId("datepicker-startDate")
        fireEvent.change(startDatePicker, { target: { value: "2026-02-01" } })

        expect(mockSetStartDate).toHaveBeenCalledWith("2026-02-01")
    })

    it("renders correctly when selected project has no description", () => {
        const projectWithoutDesc: ProjectOption = {
            id: "p-2",
            name: "Project Beta",
            internal_name: "Beta",
            description: "",
            domain: "",
            environment: [],
        }

        vi.mocked(useCvProjectForm).mockReturnValue({
            ...defaultHookReturn,
            selectedProject: projectWithoutDesc,
        } as unknown as ReturnType<typeof useCvProjectForm>)

        render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={[projectWithoutDesc]}
                existingProjectIds={[]}
            />,
        )

        expect(screen.getByTestId("textarea-project-desc")).toHaveValue("")
    })

    it("renders floating label and placeholder correctly based on roles input value", () => {
        vi.mocked(useCvProjectForm).mockReturnValue({
            ...defaultHookReturn,
            roles: "Frontend Engineer",
        } as unknown as ReturnType<typeof useCvProjectForm>)

        const { rerender } = render(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        expect(screen.getByText("roles")).toBeInTheDocument()

        vi.mocked(useCvProjectForm).mockReturnValue({
            ...defaultHookReturn,
            roles: "",
        } as unknown as ReturnType<typeof useCvProjectForm>)

        rerender(
            <CvProjectFormModal
                isOpen={true}
                onClose={mockOnClose}
                onSaved={mockOnSaved}
                cvId="cv-1"
                projects={mockProjects}
                existingProjectIds={[]}
            />,
        )

        const rolesInput = screen.getByTestId("input-roles")
        expect(rolesInput).toHaveAttribute("placeholder", "roles")
    })
})
