import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import {
    createProject,
    deleteProject,
    updateProject,
} from "@/modules/cvs/api/projects"

import {
    type ProjectFormData,
    useAdminProjects,
} from "../hooks/use-admin-projects"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/modules/cvs/api/projects", () => ({
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
}))

describe("useAdminProjects", () => {
    const mockRefresh = vi.fn()
    const mockNotificationsSuccess = vi.fn()
    const mockNotificationsError = vi.fn()
    const mockNotificationsWarning = vi.fn()
    const mockNotificationsInfo = vi.fn()

    const sampleFormData: ProjectFormData = {
        name: "E-Commerce App",
        domain: "Retail",
        start_date: "2025-01-01",
        end_date: null,
        description: "A fullstack e-commerce solution",
        environment: ["React", "Node.js", "PostgreSQL"],
    }

    const sampleProjectItem: ProjectTableItem = {
        id: "1",
        name: "Old Name",
        domain: "Retail",
        start_date: "2025-01-01",
        end_date: null,
        description: "Old description",
        environment: ["React"],
    }

    beforeEach(async () => {
        vi.clearAllMocks()

        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockNotificationsSuccess,
            error: mockNotificationsError,
            warning: mockNotificationsWarning,
            info: mockNotificationsInfo,
        })

        const navigation = await import("next/navigation")
        vi.spyOn(navigation, "useRouter").mockReturnValue({
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: mockRefresh,
            // Добавлено недостающее поле bfcacheId для AppRouterInstance
            bfcacheId: "",
        })
    })

    it("initializes with default values", () => {
        const { result } = renderHook(() => useAdminProjects())

        expect(result.current.isRemoving).toBe(false)
        expect(result.current.removeError).toBeNull()
        expect(typeof result.current.handleSave).toBe("function")
        expect(typeof result.current.handleDelete).toBe("function")
    })

    it("handles project creation successfully when project is null", async () => {
        vi.mocked(createProject).mockResolvedValueOnce({
            id: "10",
            ...sampleFormData,
        })

        const { result } = renderHook(() => useAdminProjects())

        await act(async () => {
            await result.current.handleSave(null, sampleFormData)
        })

        expect(createProject).toHaveBeenCalledTimes(1)
        expect(createProject).toHaveBeenCalledWith(sampleFormData)
        expect(updateProject).not.toHaveBeenCalled()
        expect(mockNotificationsSuccess).toHaveBeenCalledWith("created")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it("handles project update successfully when project item is provided", async () => {
        vi.mocked(updateProject).mockResolvedValueOnce({
            id: "1",
            ...sampleFormData,
        })

        const { result } = renderHook(() => useAdminProjects())

        await act(async () => {
            await result.current.handleSave(sampleProjectItem, sampleFormData)
        })

        expect(updateProject).toHaveBeenCalledTimes(1)
        expect(updateProject).toHaveBeenCalledWith({
            ...sampleFormData,
            projectId: "1",
        })
        expect(createProject).not.toHaveBeenCalled()
        expect(mockNotificationsSuccess).toHaveBeenCalledWith("updated")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it("handles project deletion successfully", async () => {
        const projectToDelete: ProjectTableItem = {
            id: "5",
            name: "Project to delete",
            domain: "Retail",
            start_date: "2025-01-01",
            end_date: null,
            description: "Delete test",
            environment: [],
        }

        vi.mocked(deleteProject).mockResolvedValueOnce({} as never)

        const { result } = renderHook(() => useAdminProjects())

        let successResult = false
        await act(async () => {
            successResult = await result.current.handleDelete(projectToDelete)
        })

        expect(successResult).toBe(true)
        expect(deleteProject).toHaveBeenCalledTimes(1)
        expect(deleteProject).toHaveBeenCalledWith({ projectId: "5" })
        expect(mockNotificationsSuccess).toHaveBeenCalledWith("deleted")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.isRemoving).toBe(false)
        expect(result.current.removeError).toBeNull()
    })

    it("handles project deletion error correctly and returns false", async () => {
        const projectToDelete: ProjectTableItem = {
            id: "5",
            name: "Project to delete",
            domain: "Retail",
            start_date: "2025-01-01",
            end_date: null,
            description: "Delete error test",
            environment: [],
        }

        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})
        vi.mocked(deleteProject).mockRejectedValueOnce(
            new Error("DB constraint violation"),
        )

        const { result } = renderHook(() => useAdminProjects())

        let successResult = true
        await act(async () => {
            successResult = await result.current.handleDelete(projectToDelete)
        })

        expect(successResult).toBe(false)
        expect(deleteProject).toHaveBeenCalledTimes(1)
        expect(mockNotificationsSuccess).not.toHaveBeenCalled()
        expect(mockRefresh).not.toHaveBeenCalled()
        expect(result.current.isRemoving).toBe(false)
        expect(result.current.removeError).toBe("removeError")

        consoleErrorSpy.mockRestore()
    })
})
