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
})
