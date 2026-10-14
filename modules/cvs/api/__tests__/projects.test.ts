import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import {
    addCvProject,
    createProject,
    deleteProject,
    getAvailableProjects,
    removeCvProject,
    updateCvProject,
    updateProject,
} from "../projects"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    GetProjectsDocument: { kind: "Document", definitions: [] },
    CreateProjectDocument: { kind: "Document", definitions: [] },
    UpdateProjectDocument: { kind: "Document", definitions: [] },
    DeleteProjectDocument: { kind: "Document", definitions: [] },
    AddCvProjectDocument: { kind: "Document", definitions: [] },
    UpdateCvProjectDocument: { kind: "Document", definitions: [] },
    RemoveCvProjectDocument: { kind: "Document", definitions: [] },
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

describe("Projects API Actions", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getGql).mockResolvedValue({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)
    })

    describe("getAvailableProjects", () => {
        it("successfully fetches available projects", async () => {
            const mockProjects = [{ id: "p-1", name: "Project Alpha" }]
            mockRequest.mockResolvedValue({ projects: { items: mockProjects } })

            const result = await getAvailableProjects()

            expect(result).toEqual(mockProjects)
            expect(mockRequest).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object))
        })
    })

    describe("createProject", () => {
        const validCreateInput = {
            name: "New Project",
            description: "Test description",
            domain: "Web",
            environment: ["React", "TypeScript"],
            start_date: "2026-01-01",
        }

        it("throws error if user is not an Admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "user-1",
                role: "User",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

            await expect(createProject(validCreateInput)).rejects.toThrow(
                "Forbidden",
            )
            expect(mockRequest).not.toHaveBeenCalled()
        })

        it("successfully creates project when user is Admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "admin-1",
                role: "Admin",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

            const created = { id: "p-2", ...validCreateInput }
            mockRequest.mockResolvedValue({ createProject: created })

            const result = await createProject(validCreateInput)

            expect(result).toEqual(created)
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
                project: validCreateInput,
            })
        })
    })

    describe("updateProject", () => {
        const validUpdateInput = {
            id: "p-1",
            projectId: "p-1",
            name: "Updated",
            description: "Updated description",
            domain: "Web",
            environment: ["React"],
            start_date: "2026-01-01",
        }

        it("throws error if user is not an Admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "user-1",
                role: "User",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

            await expect(updateProject(validUpdateInput)).rejects.toThrow(
                "Forbidden",
            )
        })

        it("successfully updates project when user is Admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "admin-1",
                role: "Admin",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

            const updated = { ...validUpdateInput }
            mockRequest.mockResolvedValue({ updateProject: updated })

            const result = await updateProject(validUpdateInput)

            expect(result).toEqual(updated)
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
                project: validUpdateInput,
            })
        })
    })

    describe("deleteProject", () => {
        const validDeleteInput = { projectId: "p-1" }

        it("throws error if user is not an Admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "user-1",
                role: "User",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

            await expect(deleteProject(validDeleteInput)).rejects.toThrow(
                "Forbidden",
            )
        })

        it("successfully deletes project when user is Admin", async () => {
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "admin-1",
                role: "Admin",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

            mockRequest.mockResolvedValue({ deleteProject: { success: true } })

            const result = await deleteProject(validDeleteInput)

            expect(result).toEqual({ success: true })
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
                project: validDeleteInput,
            })
        })
    })

    describe("CV Project relations (add, update, remove)", () => {
        const relationInput = {
            cvId: "cv-1",
            projectId: "p-1",
            responsibilities: ["Frontend development", "Code review"],
            roles: ["Developer"],
            start_date: "2026-01-01",
        }

        it("successfully adds CV project", async () => {
            const relation = { id: "rel-1", ...relationInput }
            mockRequest.mockResolvedValue({ addCvProject: relation })

            const result = await addCvProject(relationInput)

            expect(result).toEqual(relation)
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
                project: relationInput,
            })
        })

        it("successfully updates CV project", async () => {
            const relation = { id: "rel-1", ...relationInput }
            mockRequest.mockResolvedValue({ updateCvProject: relation })

            const result = await updateCvProject(relationInput)

            expect(result).toEqual(relation)
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
                project: relationInput,
            })
        })

        it("successfully removes CV project", async () => {
            mockRequest.mockResolvedValue({
                removeCvProject: { success: true },
            })

            const result = await removeCvProject(relationInput)

            expect(result).toEqual({ success: true })
            expect(mockRequest).toHaveBeenCalledWith(expect.any(Object), {
                project: relationInput,
            })
        })
    })
})
