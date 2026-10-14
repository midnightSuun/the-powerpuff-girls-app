import { revalidatePath } from "next/cache"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import {
    AddCvSkillInput,
    AddSkillDocument,
    CreateCvDocument,
    DeleteCvSkillDocument,
    DeleteCvSkillInput,
    GetSkillsDocument,
    GetUserSkillsDocument,
    UpdateCvSkillInput,
    UpdateSkillDocument,
} from "@/gql/generated/graphql"

import {
    addCvSkills,
    deleteCvSkills,
    getAvailableSkills,
    getUserSkills,
    updateCvSkill,
} from "../api/skills"

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

describe("User Skills Server Actions", () => {
    const mockRequest = vi.fn()

    beforeEach(async () => {
        vi.clearAllMocks()

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

    describe("getUserSkills", () => {
        it("returns empty values when userId is missing", async () => {
            const result = await getUserSkills("")

            expect(result).toEqual({ cvId: "", skills: [] })
            expect(mockRequest).not.toHaveBeenCalled()
        })

        it("fetches user skills and existing CV id successfully", async () => {
            const mockResponse = {
                user: {
                    cvs: [
                        {
                            id: "cv-1",
                            skills: [{ id: "s-1", name: "TypeScript" }],
                        },
                    ],
                },
            }

            mockRequest.mockResolvedValueOnce(mockResponse)

            const result = await getUserSkills("user-1")

            expect(mockRequest).toHaveBeenCalledWith(GetUserSkillsDocument, {
                userId: "user-1",
            })
            expect(result).toEqual({
                cvId: "cv-1",
                skills: [{ id: "s-1", name: "TypeScript" }],
            })
        })

        it("auto-creates a CV when user has no existing CVs", async () => {
            const mockGetUserSkillsResponse = {
                user: {
                    cvs: [],
                },
            }
            const mockCreateCvResponse = {
                createCv: { id: "new-cv-1" },
            }

            mockRequest
                .mockResolvedValueOnce(mockGetUserSkillsResponse)
                .mockResolvedValueOnce(mockCreateCvResponse)

            const result = await getUserSkills("user-1")

            expect(mockRequest).toHaveBeenCalledTimes(2)
            expect(mockRequest).toHaveBeenNthCalledWith(
                1,
                GetUserSkillsDocument,
                {
                    userId: "user-1",
                },
            )
            expect(mockRequest).toHaveBeenNthCalledWith(2, CreateCvDocument, {
                cv: {
                    name: "Main CV",
                    description: "Auto-generated primary CV",
                    userId: "user-1",
                },
            })
            expect(result).toEqual({
                cvId: "new-cv-1",
                skills: [],
            })
        })

        it("handles errors during auto-creation of CV gracefully", async () => {
            const consoleErrorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {})

            const mockGetUserSkillsResponse = {
                user: {
                    cvs: [],
                },
            }

            mockRequest
                .mockResolvedValueOnce(mockGetUserSkillsResponse)
                .mockRejectedValueOnce(new Error("Creation failed"))

            const result = await getUserSkills("user-1")

            expect(mockRequest).toHaveBeenCalledTimes(2)
            expect(result).toEqual({
                cvId: "",
                skills: [],
            })

            consoleErrorSpy.mockRestore()
        })
    })

    describe("getAvailableSkills", () => {
        it("fetches and maps available skills successfully", async () => {
            const mockResponse = {
                skills: {
                    items: [
                        {
                            id: "1",
                            name: "React",
                            category: { id: "c1", name: "Frontend" },
                        },
                        {
                            id: "2",
                            name: "Docker",
                            category: null,
                        },
                    ],
                },
            }

            mockRequest.mockResolvedValueOnce(mockResponse)

            const result = await getAvailableSkills()

            expect(mockRequest).toHaveBeenCalledWith(GetSkillsDocument)
            expect(result).toEqual([
                { id: "1", name: "React", categoryId: "c1" },
                { id: "2", name: "Docker", categoryId: "" },
            ])
        })
    })

    describe("addCvSkills", () => {
        it("adds skills to CV and revalidates path successfully", async () => {
            const input = {
                cvId: "cv-1",
                name: "TypeScript",
                mastery: "Intermediate",
            } as unknown as AddCvSkillInput
            const mutationResult = { addSkill: { success: true } }

            mockRequest.mockResolvedValueOnce(mutationResult)

            const result = await addCvSkills(input)

            expect(mockRequest).toHaveBeenCalledWith(AddSkillDocument, {
                skill: input,
            })
            expect(revalidatePath).toHaveBeenCalledWith("/skills")
            expect(result).toEqual(mutationResult)
        })
    })

    describe("updateCvSkill", () => {
        it("updates CV skill and revalidates path successfully", async () => {
            const input = {
                cvId: "cv-1",
                name: "TypeScript",
                mastery: "Advanced",
            } as unknown as UpdateCvSkillInput
            const mutationResult = { updateSkill: { success: true } }

            mockRequest.mockResolvedValueOnce(mutationResult)

            const result = await updateCvSkill(input)

            expect(mockRequest).toHaveBeenCalledWith(UpdateSkillDocument, {
                skill: input,
            })
            expect(revalidatePath).toHaveBeenCalledWith("/skills")
            expect(result).toEqual(mutationResult)
        })
    })

    describe("deleteCvSkills", () => {
        it("deletes CV skill and revalidates path successfully", async () => {
            const input: DeleteCvSkillInput = {
                cvId: "cv-1",
                name: ["TypeScript"],
            }
            const mutationResult = { deleteCvSkill: { success: true } }

            mockRequest.mockResolvedValueOnce(mutationResult)

            const result = await deleteCvSkills(input)

            expect(mockRequest).toHaveBeenCalledWith(DeleteCvSkillDocument, {
                skill: input,
            })
            expect(revalidatePath).toHaveBeenCalledWith("/skills")
            expect(result).toEqual(mutationResult)
        })
    })
})
