import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

import { useProjectForm } from "../hooks/use-project-form"

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

vi.mock("@/lib/date", () => ({
    toDateInputValue: vi.fn(
        (dateVal: string | null | undefined) => dateVal ?? "",
    ),
}))

describe("useProjectForm", () => {
    const mockOnClose = vi.fn()
    const mockOnSave = vi.fn()

    const sampleProject: ProjectTableItem = {
        id: "1",
        name: "E-Commerce App",
        domain: "Retail",
        start_date: "2025-01-01",
        end_date: "2025-06-01",
        description: "Fullstack shopping platform",
        environment: ["React", "Node.js"],
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("initializes with project values when editing an existing project", () => {
        const { result } = renderHook(() =>
            useProjectForm({
                isOpen: true,
                project: sampleProject,
                onClose: mockOnClose,
                onSave: mockOnSave,
            }),
        )

        expect(useBodyScrollLock).toHaveBeenCalledWith(true)
        expect(result.current.name).toBe("E-Commerce App")
        expect(result.current.domain).toBe("Retail")
        expect(result.current.startDate).toBe("2025-01-01")
        expect(result.current.endDate).toBe("2025-06-01")
        expect(result.current.description).toBe("Fullstack shopping platform")
        expect(result.current.environment).toEqual(["React", "Node.js"])
        expect(result.current.isValid).toBe(true)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("initializes with empty values when creating a new project", () => {
        const { result } = renderHook(() =>
            useProjectForm({
                isOpen: true,
                project: null,
                onClose: mockOnClose,
                onSave: mockOnSave,
            }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.domain).toBe("")
        expect(result.current.startDate).toBe("")
        expect(result.current.endDate).toBe("")
        expect(result.current.description).toBe("")
        expect(result.current.environment).toEqual([])
        expect(result.current.isValid).toBe(false)
    })

    it("handles field updates correctly", () => {
        const { result } = renderHook(() =>
            useProjectForm({
                isOpen: true,
                project: null,
                onClose: mockOnClose,
                onSave: mockOnSave,
            }),
        )

        act(() => {
            result.current.setName("  New Project  ")
            result.current.setDomain("Fintech")
            result.current.setStartDate("2026-01-01")
            result.current.setDescription("  A financial dashboard  ")
            result.current.setEnvironment(["TypeScript"])
        })

        expect(result.current.name).toBe("  New Project  ")
        expect(result.current.domain).toBe("Fintech")
        expect(result.current.startDate).toBe("2026-01-01")
        expect(result.current.description).toBe("  A financial dashboard  ")
        expect(result.current.environment).toEqual(["TypeScript"])
        expect(result.current.isValid).toBe(true)
    })

    it("handles successful submission, trims values, and closes modal", async () => {
        mockOnSave.mockResolvedValueOnce(undefined)
        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        const { result } = renderHook(() =>
            useProjectForm({
                isOpen: true,
                project: sampleProject,
                onClose: mockOnClose,
                onSave: mockOnSave,
            }),
        )

        act(() => {
            result.current.setName("   Updated Name   ")
        })

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnSave).toHaveBeenCalledTimes(1)
        expect(mockOnSave).toHaveBeenCalledWith(sampleProject, {
            name: "Updated Name",
            domain: "Retail",
            start_date: "2025-01-01",
            end_date: "2025-06-01",
            description: "Fullstack shopping platform",
            environment: ["React", "Node.js"],
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("does not call onSave if form is invalid", async () => {
        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        const { result } = renderHook(() =>
            useProjectForm({
                isOpen: true,
                project: null,
                onClose: mockOnClose,
                onSave: mockOnSave,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnSave).not.toHaveBeenCalled()
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it("handles save error correctly and sets error message", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})
        mockOnSave.mockRejectedValueOnce(new Error("Server error"))
        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        const { result } = renderHook(() =>
            useProjectForm({
                isOpen: true,
                project: sampleProject,
                onClose: mockOnClose,
                onSave: mockOnSave,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockOnSave).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("saveError")
        expect(result.current.isSubmitting).toBe(false)

        consoleErrorSpy.mockRestore()
    })
})
