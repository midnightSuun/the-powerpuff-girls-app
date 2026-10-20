import { notFound } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getCvById } from "@/modules/cvs/api/get-cv"
import { getAvailableProjects } from "@/modules/cvs/api/projects"
import { updateCvAction } from "@/modules/cvs/api/update-cv"

import { getCvDetailsData } from "../use-cv-details-data"

vi.mock("next/navigation", () => ({
    notFound: vi.fn(() => {
        throw new Error("NEXT_NOT_FOUND")
    }),
}))

vi.mock("@/modules/cvs/api/get-cv", () => ({
    getCvById: vi.fn(),
}))

vi.mock("@/modules/cvs/api/projects", () => ({
    getAvailableProjects: vi.fn(),
}))

vi.mock("@/modules/cvs/api/update-cv", () => ({
    updateCvAction: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

describe("getCvDetailsData", () => {
    const baseMockCv = {
        id: "cv-1",
        name: "John's CV",
        education: "MIT",
        description: "Dev",
        projects: [],
        skills: [],
        languages: [],
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("triggers notFound if CV fetch returns an error or no data", async () => {
        vi.mocked(getCvById).mockResolvedValue({ error: "Not found" })

        await expect(getCvDetailsData("cv-1")).rejects.toThrow("NEXT_NOT_FOUND")
        expect(notFound).toHaveBeenCalledTimes(1)
    })

    it("fetches CV details and empty projects list when user has no management rights", async () => {
        const mockCv = {
            ...baseMockCv,
            education: null,
        }
        vi.mocked(getCvById).mockResolvedValue({
            data: mockCv,
        })
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "user-1",
            role: "User",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await getCvDetailsData("cv-1")

        expect(result.cv).toEqual({ ...baseMockCv, education: "" })
        expect(result.canManage).toBe(false)
        expect(result.availableProjects).toEqual([])
        expect(getAvailableProjects).not.toHaveBeenCalled()
    })

    it("fetches CV details and available projects when user is Admin", async () => {
        const mockProjects = [{ id: "p-1", name: "Project Alpha" }]

        vi.mocked(getCvById).mockResolvedValue({
            data: baseMockCv,
        })
        vi.mocked(getCurrentSession).mockResolvedValue({
            userId: "admin-1",
            role: "Admin",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
        vi.mocked(getAvailableProjects).mockResolvedValue(mockProjects as never)

        const result = await getCvDetailsData("cv-1")

        expect(result.cv).toEqual(baseMockCv)
        expect(result.canManage).toBe(true)
        expect(result.availableProjects).toEqual(mockProjects)
        expect(getAvailableProjects).toHaveBeenCalledTimes(1)
    })

    describe("handleUpdate inside getCvDetailsData", () => {
        it("successfully updates CV through handleUpdate", async () => {
            vi.mocked(getCvById).mockResolvedValue({
                data: baseMockCv,
            })
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "admin-1",
                role: "Admin",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
            vi.mocked(updateCvAction).mockResolvedValue({})

            const result = await getCvDetailsData("cv-1")

            const payload = {
                name: "Updated Name",
                education: "Harvard",
                description: "New Desc",
            }

            await expect(result.handleUpdate(payload)).resolves.toBeUndefined()
            expect(updateCvAction).toHaveBeenCalledWith({
                cvId: "cv-1",
                ...payload,
            })
        })

        it("throws error if updateCvAction returns an error", async () => {
            vi.mocked(getCvById).mockResolvedValue({
                data: baseMockCv,
            })
            vi.mocked(getCurrentSession).mockResolvedValue({
                userId: "admin-1",
                role: "Admin",
            } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)
            vi.mocked(updateCvAction).mockResolvedValue({
                error: "Update failed",
            })

            const result = await getCvDetailsData("cv-1")

            const payload = {
                name: "Updated Name",
                education: "Harvard",
                description: "New Desc",
            }

            await expect(result.handleUpdate(payload)).rejects.toThrow(
                "Update failed",
            )
        })
    })
})
