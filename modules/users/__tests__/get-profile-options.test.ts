import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getProfileOptions } from "../api/get-profile-options"

vi.mock("next/headers", () => ({
    cookies: vi.fn(() => ({
        get: vi.fn(() => ({ value: "mock-token" })),
    })),
}))

vi.mock("../api/get-profile-options", () => ({
    getProfileOptions: vi.fn(),
}))

describe("getProfileOptions Server Action", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("successfully fetches departments and positions with correct pagination params", async () => {
        const mockDepartments = [{ id: "dep-1", name: "Engineering" }]
        const mockPositions = [{ id: "pos-1", name: "Developer" }]

        vi.mocked(getProfileOptions).mockResolvedValueOnce({
            departments: mockDepartments,
            positions: mockPositions,
        })

        const result = await getProfileOptions()

        expect(getProfileOptions).toHaveBeenCalledTimes(1)
        expect(result).toEqual({
            departments: mockDepartments,
            positions: mockPositions,
        })
    })

    it("throws an error when GraphQL request fails", async () => {
        vi.mocked(getProfileOptions).mockRejectedValueOnce(
            new Error("Network error"),
        )

        await expect(getProfileOptions()).rejects.toThrow("Network error")
    })
})
