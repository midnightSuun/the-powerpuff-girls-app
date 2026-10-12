import { revalidatePath } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import {
    CreateDepartmentDocument,
    DeleteDepartmentDocument,
    GetDepartmentsDocument,
    UpdateDepartmentDocument,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

import {
    createAdminDepartment,
    deleteAdminDepartment,
    getAdminDepartments,
    updateAdminDepartment,
} from "../api/departments.js"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/require-admin", () => ({
    requireAdmin: vi.fn(),
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

describe("Admin Departments Actions", () => {
    const mockGqlClient = {
        request: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getGql).mockResolvedValue(
            mockGqlClient as unknown as Awaited<ReturnType<typeof getGql>>,
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("getAdminDepartments", () => {
        it("checks admin rights and returns mapped departments successfully", async () => {
            mockGqlClient.request.mockResolvedValueOnce({
                departments: {
                    items: [
                        { id: "dept-1", name: "Engineering" },
                        { id: "dept-2", name: "HR" },
                    ],
                },
            })

            const result = await getAdminDepartments()

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                GetDepartmentsDocument,
                { params: { limit: 100 } },
            )
            expect(result).toEqual([
                { id: "dept-1", name: "Engineering" },
                { id: "dept-2", name: "HR" },
            ])
        })

        it("returns an empty array when departments items are missing", async () => {
            mockGqlClient.request.mockResolvedValueOnce({
                departments: { items: null },
            })

            const result = await getAdminDepartments()

            expect(result).toEqual([])
        })
    })

    describe("createAdminDepartment", () => {
        it("checks admin rights, executes mutation, and revalidates path", async () => {
            const input = { name: "Marketing" }
            const mockResponse = { id: "dept-3", name: "Marketing" }

            mockGqlClient.request.mockResolvedValueOnce({
                createDepartment: mockResponse,
            })

            const result = await createAdminDepartment(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                CreateDepartmentDocument,
                { department: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/departments")
            expect(result).toEqual(mockResponse)
        })

        it("throws a formatted error when mutation fails", async () => {
            const input = { name: "Marketing" }
            mockGqlClient.request.mockRejectedValueOnce(
                new Error("GraphQL Error"),
            )

            await expect(createAdminDepartment(input)).rejects.toThrow(
                "Failed to create department",
            )
        })
    })

    describe("updateAdminDepartment", () => {
        it("checks admin rights, updates department, and revalidates path", async () => {
            const input = {
                departmentId: "dept-1",
                name: "Updated Engineering",
            }
            const mockResponse = { id: "dept-1", name: "Updated Engineering" }

            mockGqlClient.request.mockResolvedValueOnce({
                updateDepartment: mockResponse,
            })

            const result = await updateAdminDepartment(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                UpdateDepartmentDocument,
                { department: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/departments")
            expect(result).toEqual(mockResponse)
        })

        it("throws a formatted error when update mutation fails", async () => {
            const input = { departmentId: "dept-1", name: "Updated" }
            mockGqlClient.request.mockRejectedValueOnce(new Error("DB Error"))

            await expect(updateAdminDepartment(input)).rejects.toThrow(
                "Failed to update department",
            )
        })
    })

    describe("deleteAdminDepartment", () => {
        it("checks admin rights, deletes department, and revalidates path", async () => {
            const input: Parameters<typeof deleteAdminDepartment>[0] = {
                departmentId: "dept-1",
            }
            const mockResponse = { success: true }

            mockGqlClient.request.mockResolvedValueOnce({
                deleteDepartment: mockResponse,
            })

            const result = await deleteAdminDepartment(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                DeleteDepartmentDocument,
                { department: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/departments")
            expect(result).toEqual(mockResponse)
        })

        it("throws a specific in-use error when deletion fails", async () => {
            const input: Parameters<typeof deleteAdminDepartment>[0] = {
                departmentId: "dept-1",
            }
            mockGqlClient.request.mockRejectedValueOnce(
                new Error("Constraint violation"),
            )

            await expect(deleteAdminDepartment(input)).rejects.toThrow(
                "Department cannot be deleted because it is currently in use",
            )
        })
    })
})
