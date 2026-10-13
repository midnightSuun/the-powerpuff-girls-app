import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import {
    CreatePositionDocument,
    DeletePositionDocument,
    DeletePositionInput,
    GetPositionsDocument,
    UpdatePositionDocument,
    UpdatePositionInput,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

import {
    createAdminPosition,
    deleteAdminPosition,
    getAdminPositions,
    updateAdminPosition,
} from "../api/positions"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/require-admin", () => ({
    requireAdmin: vi.fn(),
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

describe("Positions Server Actions", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getGql).mockResolvedValue({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)
    })

    describe("getAdminPositions", () => {
        it("fetches positions successfully after checking admin rights", async () => {
            mockRequest.mockResolvedValueOnce({
                positions: {
                    items: [
                        { id: "1", name: "Frontend Developer" },
                        { id: "2", name: "Backend Developer" },
                    ],
                },
            })

            const result = await getAdminPositions("Developer")

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(GetPositionsDocument, {
                params: { limit: 100, search: "Developer" },
            })
            expect(result).toEqual([
                { id: "1", name: "Frontend Developer" },
                { id: "2", name: "Backend Developer" },
            ])
        })

        it("returns an empty array when positions items are null or undefined", async () => {
            mockRequest.mockResolvedValueOnce({
                positions: { items: null },
            })

            const result = await getAdminPositions("")

            expect(result).toEqual([])
        })
    })

    describe("createAdminPosition", () => {
        it("creates position successfully, revalidates path and returns data", async () => {
            const input = { name: "QA Engineer" }
            mockRequest.mockResolvedValueOnce({
                createPosition: { id: "3", name: "QA Engineer" },
            })

            const result = await createAdminPosition(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(CreatePositionDocument, {
                position: input,
            })
            expect(result).toEqual({ id: "3", name: "QA Engineer" })
        })

        it("throws an error when creation fails", async () => {
            mockRequest.mockRejectedValueOnce(new Error("Network error"))

            await expect(
                createAdminPosition({ name: "DevOps" }),
            ).rejects.toThrow("Failed to create position")
        })
    })

    describe("updateAdminPosition", () => {
        it("updates position successfully and revalidates path", async () => {
            const input = {
                positionId: "1",
                name: "Senior Frontend",
            } as unknown as UpdatePositionInput
            mockRequest.mockResolvedValueOnce({
                updatePosition: { id: "1", name: "Senior Frontend" },
            })

            const result = await updateAdminPosition(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(UpdatePositionDocument, {
                position: input,
            })
            expect(result).toEqual({ id: "1", name: "Senior Frontend" })
        })

        it("throws an error when update fails", async () => {
            mockRequest.mockRejectedValueOnce(new Error("DB error"))

            await expect(
                updateAdminPosition({
                    positionId: "1",
                    name: "Fail",
                } as unknown as UpdatePositionInput),
            ).rejects.toThrow("Failed to update position")
        })
    })

    describe("deleteAdminPosition", () => {
        it("deletes position successfully and revalidates path", async () => {
            const input = { positionId: "1" } as DeletePositionInput
            mockRequest.mockResolvedValueOnce({
                deletePosition: { success: true },
            })

            const result = await deleteAdminPosition(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockRequest).toHaveBeenCalledWith(DeletePositionDocument, {
                position: input,
            })
            expect(result).toEqual({ success: true })
        })

        it("throws a specific in-use error when deletion fails", async () => {
            mockRequest.mockRejectedValueOnce(
                new Error("Foreign key violation"),
            )

            await expect(
                deleteAdminPosition({ positionId: "1" } as DeletePositionInput),
            ).rejects.toThrow(
                "Position cannot be deleted because it is currently in use",
            )
        })
    })
})
