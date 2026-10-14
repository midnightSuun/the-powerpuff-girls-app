import { act, renderHook } from "@testing-library/react"
import { useTranslations } from "next-intl"
import type { SyntheticEvent } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { addCvProject, updateCvProject } from "../../api/projects"
import { useCvProjectForm } from "../use-cv-project-form"

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

vi.mock("../../api/projects", () => ({
    addCvProject: vi.fn(),
    updateCvProject: vi.fn(),
}))

vi.mock("@/lib/date", () => ({
    toDateInputValue: vi.fn((val?: string | null) => (val ? "2024-01-01" : "")),
}))

describe("useCvProjectForm", () => {
    const mockT = vi.fn((key: string) => key)
    const mockSuccessNotification = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnSaved = vi.fn()

    const mockProjects: ProjectOption[] = [
        {
            id: "p-1",
            name: "Project One",
            internal_name: "Internal One",
            description: "Desc",
            domain: "Fintech",
            environment: ["React"],
        },
        {
            id: "p-2",
            name: "Project Two",
            internal_name: "Internal Two",
            description: "Desc",
            domain: "Healthcare",
            environment: ["Node"],
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useTranslations).mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>,
        )
        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
        } as unknown as ReturnType<typeof useActionNotifications>)
    })

    it("initializes with default values for creation mode", () => {
        const { result } = renderHook(() =>
            useCvProjectForm({
                isOpen: true,
                onClose: mockOnClose,
                onSaved: mockOnSaved,
                cvId: "cv-1",
                project: null,
                projects: mockProjects,
                existingProjectIds: ["p-1"],
            }),
        )

        expect(useBodyScrollLock).toHaveBeenCalledWith(true)
        expect(result.current.projectId).toBe("")
        expect(result.current.startDate).toBe("")
        expect(result.current.endDate).toBe("")
        expect(result.current.roles).toBe("")
        expect(result.current.responsibilities).toBe("")
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
        expect(result.current.availableProjects).toEqual([mockProjects[1]])
    })

    it("initializes with values for edit mode", () => {
        const existingProject: CvProjectItem = {
            id: "rel-1",
            name: "Project One",
            internal_name: "Internal One",
            description: "Desc",
            domain: "Fintech",
            start_date: "2024-01-01T00:00:00.000Z",
            end_date: "2024-06-01T00:00:00.000Z",
            roles: ["Developer"],
            responsibilities: ["Coding"],
            environment: ["React"],
            project: mockProjects[0],
        }

        const { result } = renderHook(() =>
            useCvProjectForm({
                isOpen: true,
                onClose: mockOnClose,
                onSaved: mockOnSaved,
                cvId: "cv-1",
                project: existingProject,
                projects: mockProjects,
                existingProjectIds: ["p-1"],
            }),
        )

        expect(result.current.projectId).toBe("p-1")
        expect(result.current.startDate).toBe("2024-01-01")
        expect(result.current.endDate).toBe("2024-01-01")
        expect(result.current.roles).toBe("Developer")
        expect(result.current.responsibilities).toBe("Coding")
        expect(result.current.isValid).toBe(true)
        expect(result.current.availableProjects).toEqual(mockProjects)
    })

    it("prevents submission and sets error if project is duplicate during creation", async () => {
        const { result } = renderHook(() =>
            useCvProjectForm({
                isOpen: true,
                onClose: mockOnClose,
                onSaved: mockOnSaved,
                cvId: "cv-1",
                project: null,
                projects: mockProjects,
                existingProjectIds: ["p-1"],
            }),
        )

        act(() => {
            result.current.setProjectId("p-1")
            result.current.setStartDate("2024-01-01")
        })

        expect(result.current.isValid).toBe(false)

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBe("duplicateProjectError")
        expect(addCvProject).not.toHaveBeenCalled()
    })

    it("successfully adds a new project when form is valid", async () => {
        vi.mocked(addCvProject).mockResolvedValue({} as never)

        const { result } = renderHook(() =>
            useCvProjectForm({
                isOpen: true,
                onClose: mockOnClose,
                onSaved: mockOnSaved,
                cvId: "cv-1",
                project: null,
                projects: mockProjects,
                existingProjectIds: [],
            }),
        )

        act(() => {
            result.current.setProjectId("p-2")
            result.current.setStartDate("2024-02-01")
            result.current.setRoles("Lead, Architect")
            result.current.setResponsibilities("Design")
        })

        expect(result.current.isValid).toBe(true)

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(addCvProject).toHaveBeenCalledTimes(1)
        expect(addCvProject).toHaveBeenCalledWith({
            cvId: "cv-1",
            projectId: "p-2",
            start_date: "2024-02-01",
            end_date: null,
            roles: ["Lead", "Architect"],
            responsibilities: ["Design"],
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("created")
        expect(mockOnSaved).toHaveBeenCalledTimes(1)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it("successfully updates an existing project", async () => {
        const existingProject: CvProjectItem = {
            id: "rel-1",
            name: "Project One",
            internal_name: "Internal One",
            description: "Desc",
            domain: "Fintech",
            start_date: "2024-01-01T00:00:00.000Z",
            end_date: null,
            roles: ["Developer"],
            responsibilities: ["Coding"],
            environment: ["React"],
            project: mockProjects[0],
        }

        vi.mocked(updateCvProject).mockResolvedValue({} as never)

        const { result } = renderHook(() =>
            useCvProjectForm({
                isOpen: true,
                onClose: mockOnClose,
                onSaved: mockOnSaved,
                cvId: "cv-1",
                project: existingProject,
                projects: mockProjects,
                existingProjectIds: ["p-1"],
            }),
        )

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(updateCvProject).toHaveBeenCalledTimes(1)
        expect(mockSuccessNotification).toHaveBeenCalledWith("updated")
        expect(mockOnSaved).toHaveBeenCalledTimes(1)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it("handles API errors gracefully during submission", async () => {
        vi.mocked(addCvProject).mockRejectedValue(new Error("API Error"))

        const { result } = renderHook(() =>
            useCvProjectForm({
                isOpen: true,
                onClose: mockOnClose,
                onSaved: mockOnSaved,
                cvId: "cv-1",
                project: null,
                projects: mockProjects,
                existingProjectIds: [],
            }),
        )

        act(() => {
            result.current.setProjectId("p-1")
            result.current.setStartDate("2024-01-01")
        })

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.error).toBe("saveError")
        expect(mockOnSaved).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
    })
})
