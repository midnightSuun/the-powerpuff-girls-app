import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { removeCvProject } from "@/modules/cvs/api/projects"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { useCvProjects } from "../use-cv-projects"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/modules/cvs/api/projects", () => ({
    removeCvProject: vi.fn(),
}))

describe("useCvProjects", () => {
    const mockRefresh = vi.fn()
    const mockT = vi.fn((key: string) => key)
    const mockSuccessNotification = vi.fn()

    const mockProjects: CvProjectItem[] = [
        {
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
            project: { id: "p-1" },
        },
    ]

    const mockAvailableProjects: ProjectOption[] = [
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
        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRefresh,
        } as unknown as ReturnType<typeof useRouter>)
        vi.mocked(useTranslations).mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>,
        )
        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
        } as unknown as ReturnType<typeof useActionNotifications>)
    })

    it("initializes with default states and computes existing IDs and availableToAdd correctly", () => {
        const { result } = renderHook(() =>
            useCvProjects({
                cvId: "cv-1",
                projects: mockProjects,
                availableProjects: mockAvailableProjects,
            }),
        )

        expect(result.current.isAddOpen).toBe(false)
        expect(result.current.editingProject).toBeNull()
        expect(result.current.isRemoving).toBe(false)
        expect(result.current.removeError).toBeNull()
        expect(result.current.existingProjectIds).toEqual(["p-1"])
        expect(result.current.availableToAdd).toBe(true)
    })

    it("computes availableToAdd as false if all available projects are already added", () => {
        const { result } = renderHook(() =>
            useCvProjects({
                cvId: "cv-1",
                projects: mockProjects,
                availableProjects: [mockAvailableProjects[0]],
            }),
        )

        expect(result.current.availableToAdd).toBe(false)
    })

    it("successfully removes a project, shows success notification, and refreshes router", async () => {
        vi.mocked(removeCvProject).mockResolvedValue({} as never)

        const { result } = renderHook(() =>
            useCvProjects({
                cvId: "cv-1",
                projects: mockProjects,
                availableProjects: mockAvailableProjects,
            }),
        )

        let successResult = false
        await act(async () => {
            successResult = await result.current.handleRemove(mockProjects[0])
        })

        expect(successResult).toBe(true)
        expect(removeCvProject).toHaveBeenCalledTimes(1)
        expect(removeCvProject).toHaveBeenCalledWith({
            cvId: "cv-1",
            projectId: "p-1",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("deleted")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.removeError).toBeNull()
        expect(result.current.isRemoving).toBe(false)
    })

    it("handles removal errors gracefully, sets removeError and returns false", async () => {
        vi.mocked(removeCvProject).mockRejectedValue(new Error("API Error"))

        const { result } = renderHook(() =>
            useCvProjects({
                cvId: "cv-1",
                projects: mockProjects,
                availableProjects: mockAvailableProjects,
            }),
        )

        let successResult = true
        await act(async () => {
            successResult = await result.current.handleRemove(mockProjects[0])
        })

        expect(successResult).toBe(false)
        expect(result.current.removeError).toBe("removeError")
        expect(mockSuccessNotification).not.toHaveBeenCalled()
        expect(mockRefresh).not.toHaveBeenCalled()
        expect(result.current.isRemoving).toBe(false)
    })

    it("triggers router refresh when refresh helper is called", () => {
        const { result } = renderHook(() =>
            useCvProjects({
                cvId: "cv-1",
                projects: mockProjects,
                availableProjects: mockAvailableProjects,
            }),
        )

        act(() => {
            result.current.refresh()
        })

        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
})
