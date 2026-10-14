import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteSkillsButton } from "../hooks/use-delete-skills-button"

const {
    mockRouterRefresh,
    mockUseTranslations,
    mockNotificationsSuccess,
    mockDeleteCvSkills,
} = vi.hoisted(() => ({
    mockRouterRefresh: vi.fn(),
    mockUseTranslations: vi.fn(),
    mockNotificationsSuccess: vi.fn(),
    mockDeleteCvSkills: vi.fn(),
}))

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        refresh: mockRouterRefresh,
    })),
}))

vi.mock("next-intl", () => ({
    useTranslations: mockUseTranslations,
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(() => ({
        success: mockNotificationsSuccess,
    })),
}))

vi.mock("@/modules/skills/api/skills", () => ({
    deleteCvSkills: mockDeleteCvSkills,
}))

describe("useDeleteSkillsButton hook", () => {
    const mockOnToggleSelectionMode = vi.fn()
    const mockOnClearSelection = vi.fn()

    const defaultProps = {
        cvId: "cv-1",
        selectedSkills: ["React", "TypeScript"],
        onToggleSelectionMode: mockOnToggleSelectionMode,
        onClearSelection: mockOnClearSelection,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseTranslations.mockReturnValue((key: string) => key)
    })

    it("initializes with default states", () => {
        const { result } = renderHook(() => useDeleteSkillsButton(defaultProps))

        expect(result.current.isModalOpen).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.hasSelected).toBe(true)
        expect(typeof result.current.setIsModalOpen).toBe("function")
        expect(typeof result.current.handleDeleteConfirm).toBe("function")
        expect(typeof result.current.handleCancel).toBe("function")
    })

    it("handles cancel action correctly", () => {
        const { result } = renderHook(() => useDeleteSkillsButton(defaultProps))

        act(() => {
            result.current.handleCancel()
        })

        expect(mockOnClearSelection).toHaveBeenCalledTimes(1)
        expect(mockOnToggleSelectionMode).toHaveBeenCalledWith(false)
    })

    it("handles successful deletion confirmation and cleanup", async () => {
        mockDeleteCvSkills.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() => useDeleteSkillsButton(defaultProps))

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(mockDeleteCvSkills).toHaveBeenCalledWith({
            cvId: "cv-1",
            name: ["React", "TypeScript"],
        })
        expect(mockNotificationsSuccess).toHaveBeenCalledWith("deleted")
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
        expect(mockOnClearSelection).toHaveBeenCalledTimes(1)
        expect(mockOnToggleSelectionMode).toHaveBeenCalledWith(false)
        expect(result.current.isModalOpen).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
    })
})
