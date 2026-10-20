import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { useProjectForm } from "@/modules/projects/hooks/use-project-form"

import { ProjectFormModal } from "../ui/project-form-modal"

vi.mock("@/modules/projects/hooks/use-project-form", () => ({
    useProjectForm: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        onClose,
        onSubmit,
        onConfirm,
        children,
        error,
    }: {
        isOpen: boolean
        title: string
        onClose: () => void
        onSubmit?: (e: React.SyntheticEvent) => void
        onConfirm?: (e: React.SyntheticEvent) => void
        children: React.ReactNode
        error: string | null
    }) => {
        const handleAction = (e: React.SyntheticEvent) => {
            e.preventDefault()
            if (onSubmit) onSubmit(e)
            else if (onConfirm) onConfirm(e)
        }

        return isOpen ? (
            <div data-testid="base-modal">
                <h1>{title}</h1>
                {error && <span data-testid="modal-error">{error}</span>}
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                <form data-testid="modal-form" onSubmit={handleAction}>
                    {children}
                    <button type="submit" data-testid="modal-confirm">
                        Confirm
                    </button>
                </form>
            </div>
        ) : null
    },
}))

vi.mock("../ui/environment-multiselect", () => ({
    EnvironmentMultiselect: ({
        value,
        onChange,
    }: {
        value: string[]
        onChange: (val: string[]) => void
    }) => (
        <div data-testid="environment-multiselect">
            <span>{value.join(", ")}</span>
            <button
                type="button"
                data-testid="add-env-btn"
                onClick={() => onChange([...value, "React"])}
            >
                Add React
            </button>
        </div>
    ),
}))

vi.mock("@/components/ui/date-picker", () => ({
    DatePicker: ({
        value,
        onChange,
        placeholder,
    }: {
        value: string
        onChange: (val: string) => void
        placeholder: string
    }) => (
        <div data-testid={`date-picker-${placeholder}`}>
            <input
                data-testid={`date-input-${placeholder}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    ),
}))

vi.mock("@/components/ui/input", () => ({
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input {...props} />
    ),
}))

vi.mock("@/components/ui/textarea", () => ({
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
        <textarea {...props} />
    ),
}))

type HookReturnType = ReturnType<typeof useProjectForm>

describe("ProjectFormModal", () => {
    const mockSetName = vi.fn()
    const mockSetDomain = vi.fn()
    const mockSetStartDate = vi.fn()
    const mockSetEndDate = vi.fn()
    const mockSetDescription = vi.fn()
    const mockSetEnvironment = vi.fn()
    const mockHandleSubmit = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnSave = vi.fn()

    const environmentOptions = ["React", "Node.js", "TypeScript"]

    const defaultHookValues: HookReturnType = {
        t: ((key: string) => key) as unknown as ReturnType<
            typeof useProjectForm
        >["t"],
        name: "",
        setName: mockSetName,
        domain: "",
        setDomain: mockSetDomain,
        startDate: "",
        setStartDate: mockSetStartDate,
        endDate: "",
        setEndDate: mockSetEndDate,
        description: "",
        setDescription: mockSetDescription,
        environment: [],
        setEnvironment: mockSetEnvironment,
        error: null,
        isSubmitting: false,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useProjectForm).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders create modal when project is not provided", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByText("createTitle")).toBeInTheDocument()
        expect(
            screen.getByTestId("environment-multiselect"),
        ).toBeInTheDocument()
    })

    it("renders update modal when project is provided", () => {
        const sampleProject: ProjectTableItem = {
            id: "1",
            name: "Alpha",
            domain: "Fintech",
            start_date: "2025-01-01",
            end_date: null,
            description: "Test project",
            environment: ["React"],
        }

        render(
            <ProjectFormModal
                isOpen={true}
                project={sampleProject}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("updateTitle")).toBeInTheDocument()
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <ProjectFormModal
                isOpen={false}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("triggers input changes correctly", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const inputs = screen.getAllByRole("textbox")
        const nameInput = inputs[0]
        const domainInput = inputs[1]

        fireEvent.change(nameInput, { target: { value: "New Project" } })
        expect(mockSetName).toHaveBeenCalledWith("New Project")

        fireEvent.change(domainInput, { target: { value: "Retail" } })
        expect(mockSetDomain).toHaveBeenCalledWith("Retail")
    })

    it("triggers environment change via multiselect component", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const addEnvButton = screen.getByTestId("add-env-btn")
        fireEvent.click(addEnvButton)

        expect(mockSetEnvironment).toHaveBeenCalledWith(["React"])
    })

    it("renders server error when error state is present", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            error: "Failed to save project",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to save project",
        )
    })

    it("triggers form submission on submit event", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const form = screen.getByTestId("modal-form")
        act(() => {
            fireEvent.submit(form)
        })

        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it("displays name label when name field has value", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            name: "My Project",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("name")).toBeInTheDocument()
    })

    it("displays domain label when domain field has value", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            domain: "Fintech",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("domain")).toBeInTheDocument()
    })

    it("displays startDate label when startDate field has value", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            startDate: "2025-01-01",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("startDate")).toBeInTheDocument()
    })

    it("displays endDate label when endDate field has value", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            endDate: "2025-12-31",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("endDate")).toBeInTheDocument()
    })

    it("displays description label when description field has value", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            description: "A new project",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("description")).toBeInTheDocument()
    })

    it("displays environment label when environment array has items", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            environment: ["React", "Node.js"],
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("environment")).toBeInTheDocument()
    })

    it("displays all labels when all fields have values", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            name: "React App",
            domain: "Fintech",
            startDate: "2025-01-01",
            endDate: "2025-12-31",
            description: "A React application",
            environment: ["React", "Node.js"],
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("name")).toBeInTheDocument()
        expect(screen.getByText("domain")).toBeInTheDocument()
        expect(screen.getByText("startDate")).toBeInTheDocument()
        expect(screen.getByText("endDate")).toBeInTheDocument()
        expect(screen.getByText("description")).toBeInTheDocument()
        expect(screen.getByText("environment")).toBeInTheDocument()
    })

    it("disables confirm button when form is invalid", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            isValid: false,
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const confirmButton = screen.getByTestId("modal-confirm")
        expect(confirmButton).toBeInTheDocument()
    })

    it("shows pending text when form is submitting", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            isSubmitting: true,
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
    })

    it("uses appropriate button text for update mode", () => {
        const sampleProject: ProjectTableItem = {
            id: "1",
            name: "Alpha",
            domain: "Fintech",
            start_date: "2025-01-01",
            end_date: null,
            description: "Test project",
            environment: ["React"],
        }

        render(
            <ProjectFormModal
                isOpen={true}
                project={sampleProject}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByText("updateTitle")).toBeInTheDocument()
    })

    it("displays environment without label when array is empty", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            environment: [],
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(
            screen.getByTestId("environment-multiselect"),
        ).toBeInTheDocument()
        const environmentLabels = screen.queryAllByText("environment")
        expect(environmentLabels).toHaveLength(0)
    })

    it("handles empty endDate with populated startDate", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            startDate: "2025-01-01",
            endDate: "",
            isValid: true,
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        const startDateElements = screen.queryAllByText("startDate")
        expect(startDateElements.length).toBeGreaterThan(0)
    })

    it("triggers startDate change via DatePicker", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const startDateInput = screen.getByTestId("date-input-startDate")
        fireEvent.change(startDateInput, { target: { value: "2025-03-01" } })

        expect(mockSetStartDate).toHaveBeenCalledWith("2025-03-01")
    })

    it("triggers endDate change via DatePicker", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const endDateInput = screen.getByTestId("date-input-endDate")
        fireEvent.change(endDateInput, { target: { value: "2025-12-31" } })

        expect(mockSetEndDate).toHaveBeenCalledWith("2025-12-31")
    })

    it("triggers description change via Textarea", () => {
        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const descriptionTextarea = screen.getByLabelText("description")

        fireEvent.change(descriptionTextarea, {
            target: { value: "New description text" },
        })

        expect(mockSetDescription).toHaveBeenCalledWith("New description text")
    })

    it("clears endDate when startDate is changed to be after endDate", () => {
        const mockSetStartDateWithLogic = vi.fn((newStart) => {
            const currentEndDate = "2025-06-01"
            if (currentEndDate && newStart > currentEndDate) {
                mockSetEndDate("")
            }
        })

        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            startDate: "2025-01-01",
            endDate: "2025-06-01",
            setStartDate: mockSetStartDateWithLogic,
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const startDateInput = screen.getByTestId("date-input-startDate")
        fireEvent.change(startDateInput, { target: { value: "2025-07-01" } })

        expect(mockSetStartDateWithLogic).toHaveBeenCalledWith("2025-07-01")
    })

    it("renders DatePicker with maxDate when endDate is set", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            endDate: "2025-12-31",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("date-picker-startDate")).toBeInTheDocument()
    })

    it("renders DatePicker with minDate when startDate is set", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            startDate: "2025-01-01",
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("date-picker-endDate")).toBeInTheDocument()
    })

    it("applies correct className for editing mode on DatePicker", () => {
        const sampleProject: ProjectTableItem = {
            id: "1",
            name: "Test",
            domain: "Tech",
            start_date: "2025-01-01",
            end_date: null,
            description: "Test",
            environment: [],
        }

        render(
            <ProjectFormModal
                isOpen={true}
                project={sampleProject}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("date-picker-startDate")).toBeInTheDocument()
        expect(screen.getByTestId("date-picker-endDate")).toBeInTheDocument()
    })

    it("applies correct className for editing mode on Textarea", () => {
        const sampleProject: ProjectTableItem = {
            id: "1",
            name: "Test",
            domain: "Tech",
            start_date: "2025-01-01",
            end_date: null,
            description: "Test",
            environment: [],
        }

        render(
            <ProjectFormModal
                isOpen={true}
                project={sampleProject}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        const textareas = screen.getAllByRole("textbox")
        expect(textareas.length).toBeGreaterThan(0)
    })

    it("passes removeLabel callback to EnvironmentMultiselect", () => {
        vi.mocked(useProjectForm).mockReturnValue({
            ...defaultHookValues,
            environment: ["React", "Node.js"],
        })

        render(
            <ProjectFormModal
                isOpen={true}
                project={null}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(
            screen.getByTestId("environment-multiselect"),
        ).toBeInTheDocument()
    })

    it("passes compact prop based on isEditing mode", () => {
        const sampleProject: ProjectTableItem = {
            id: "1",
            name: "Test",
            domain: "Tech",
            start_date: "2025-01-01",
            end_date: null,
            description: "Test",
            environment: ["React"],
        }

        render(
            <ProjectFormModal
                isOpen={true}
                project={sampleProject}
                environmentOptions={environmentOptions}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />,
        )

        expect(
            screen.getByTestId("environment-multiselect"),
        ).toBeInTheDocument()
    })
})
