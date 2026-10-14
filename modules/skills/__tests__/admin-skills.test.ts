import { revalidatePath } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import {
    CreateSkillDocument,
    DeleteSkillDocument,
    GetAdminSkillsDocument,
    GetSkillCategoriesDocument,
    UpdateAdminSkillDocument,
    UpdateSkillInput,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

import {
    createAdminSkill,
    deleteAdminSkill,
    getAdminSkills,
    getSkillCategories,
    updateAdminSkill,
} from "../api/admin-skills"

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/require-admin", () => ({
    requireAdmin: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

describe("Admin Skills Server Actions", () => {
    const mockRequest = vi.fn()

    beforeEach(async () => {
        vi.clearAllMocks()

        vi.mocked(requireAdmin).mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        } as unknown as Awaited<ReturnType<typeof requireAdmin>>)

        vi.mocked(getGql).mockResolvedValue({
            request: mockRequest,
            url: "",
            requestConfig: {},
            rawRequest: vi.fn(),
            batchRequests: vi.fn(),
            setHeader: vi.fn(),
            setHeaders: vi.fn(),
            setHeaderInternal: vi.fn(),
        } as unknown as Awaited<ReturnType<typeof getGql>>)
    })

    describe("getAdminSkills", () => {
        it("fetches and maps admin skills successfully", async () => {
            const mockResponse = {
                skills: {
                    items: [
                        {
                            id: "1",
                            name: "TypeScript",
                            category: { id: "c1", name: "Programming" },
                        },
                        {
                            id: "2",
                            name: "Management",
                            category: null,
                        },
                    ],
                },
            }

            mockRequest.mockResolvedValueOnce(mockResponse)

            const result = await getAdminSkills()

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(GetAdminSkillsDocument)
            expect(result).toEqual([
                {
                    id: "1",
                    name: "TypeScript",
                    category: "Programming",
                    categoryId: "c1",
                },
                {
                    id: "2",
                    name: "Management",
                    category: "Uncategorized",
                    categoryId: "",
                },
            ])
        })
    })

    describe("getSkillCategories", () => {
        it("fetches and maps skill categories successfully", async () => {
            const mockResponse = {
                skillCategories: [
                    { id: "c1", name: "Programming" },
                    { id: "c2", name: "Design" },
                ],
            }

            mockRequest.mockResolvedValueOnce(mockResponse)

            const result = await getSkillCategories()

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(GetSkillCategoriesDocument)
            expect(result).toEqual([
                { id: "c1", name: "Programming" },
                { id: "c2", name: "Design" },
            ])
        })
    })

    describe("createAdminSkill", () => {
        it("creates a skill and revalidates path successfully", async () => {
            const input = { name: "React", categoryId: "c1" }
            const createdSkill = { id: "10", name: "React" }

            mockRequest.mockResolvedValueOnce({ createSkill: createdSkill })

            const result = await createAdminSkill(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(CreateSkillDocument, {
                skill: input,
            })
            expect(revalidatePath).toHaveBeenCalledWith("/skills")
            expect(result).toEqual(createdSkill)
        })
    })

    describe("updateAdminSkill", () => {
        it("updates a skill and revalidates path successfully", async () => {
            const input: UpdateSkillInput = {
                skillId: "10",
                name: "React.js",
                categoryId: "c1",
            }
            const updatedSkill = { id: "10", name: "React.js" }

            mockRequest.mockResolvedValueOnce({ updateSkill: updatedSkill })

            const result = await updateAdminSkill(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(UpdateAdminSkillDocument, {
                skill: input,
            })
            expect(revalidatePath).toHaveBeenCalledWith("/skills")
            expect(result).toEqual(updatedSkill)
        })
    })

    describe("deleteAdminSkill", () => {
        it("deletes a skill and revalidates path successfully", async () => {
            const input = { skillId: "10" }
            const deleteResult = { success: true }

            mockRequest.mockResolvedValueOnce({ deleteSkill: deleteResult })

            const result = await deleteAdminSkill(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(DeleteSkillDocument, {
                skill: input,
            })
            expect(revalidatePath).toHaveBeenCalledWith("/skills")
            expect(result).toEqual(deleteResult)
        })
    })
})
