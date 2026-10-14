import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getProfileOptions } from "../api/get-profile-options"
import { useProfileOptions } from "../hooks/use-profile-options"
import { type SelectOption, withCurrentOption } from "../select-option"

vi.mock("../api/get-profile-options", () => ({
    getProfileOptions: vi.fn(),
}))

vi.mock("../select-option", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../select-option")>()
    return {
        ...actual,
        withCurrentOption: vi.fn((options) => options),
    }
})

describe("useProfileOptions Hook", () => {
    const mockDepartments = [
        { id: "dep-1", name: "Engineering" },
        { id: "dep-2", name: "HR" },
    ]
    const mockPositions = [
        { id: "pos-1", name: "Developer" },
        { id: "pos-2", name: "Manager" },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getProfileOptions).mockResolvedValue({
            departments: mockDepartments,
            positions: mockPositions,
        })
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("initializes with empty options when no current values provided and dialog is closed", () => {
        const { result } = renderHook(() => useProfileOptions(false))

        expect(result.current.departments).toEqual([])
        expect(result.current.positions).toEqual([])
        expect(getProfileOptions).not.toHaveBeenCalled()
    })

    it("initializes with current department and position if provided", () => {
        const currentDep = { id: "dep-current", name: "Current Dep" }
        const currentPos = { id: "pos-current", name: "Current Pos" }

        const { result } = renderHook(() =>
            useProfileOptions(false, currentDep, currentPos),
        )

        expect(result.current.departments).toEqual([currentDep])
        expect(result.current.positions).toEqual([currentPos])
    })

    it("does not fetch options when isOpen is false", () => {
        renderHook(() => useProfileOptions(false))

        expect(getProfileOptions).not.toHaveBeenCalled()
    })

    it("fetches and sets options when isOpen becomes true", async () => {
        vi.mocked(withCurrentOption).mockImplementation((opts) => opts)

        const { result } = renderHook(() => useProfileOptions(true))

        expect(getProfileOptions).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            expect(result.current.departments).toEqual(mockDepartments)
            expect(result.current.positions).toEqual(mockPositions)
        })

        expect(withCurrentOption).toHaveBeenCalledWith(
            mockDepartments,
            undefined,
        )
        expect(withCurrentOption).toHaveBeenCalledWith(mockPositions, undefined)
    })

    it("updates options when currentDepartment or currentPosition changes", () => {
        const initialDep: SelectOption = { id: "dep-1", name: "Dep 1" }
        const newDep: SelectOption = { id: "dep-2", name: "Dep 2" }

        const { result, rerender } = renderHook(
            ({
                isOpen,
                dept,
            }: {
                isOpen: boolean
                dept: SelectOption | null
            }) => useProfileOptions(isOpen, dept, null),
            { initialProps: { isOpen: false, dept: initialDep } },
        )

        expect(result.current.departments).toEqual([initialDep])

        rerender({ isOpen: false, dept: newDep })

        expect(result.current.departments).toEqual([newDep])
    })

    it("handles errors gracefully when getProfileOptions fails", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})
        vi.mocked(getProfileOptions).mockRejectedValueOnce(
            new Error("Network error"),
        )

        const { result } = renderHook(() => useProfileOptions(true))

        await waitFor(() => {
            expect(getProfileOptions).toHaveBeenCalledTimes(1)
        })

        expect(consoleErrorSpy).toHaveBeenCalled()
        consoleErrorSpy.mockRestore()
    })
})
