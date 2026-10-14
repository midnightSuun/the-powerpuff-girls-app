import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useUserSelectionState } from "@/hooks/use-user-selection-state"
import { updateCvSkill } from "@/modules/skills/api/skills"

import { useSkillsView } from "../hooks/use-skills-view"
import type { Skill } from "../ui/components/user/skill-category"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/hooks/use-user-selection-state", () => ({
    useUserSelectionState: vi.fn(),
}))

vi.mock("@/modules/skills/api/skills", () => ({
    updateCvSkill: vi.fn(),
}))

describe("useSkillsView", () => {
    const mockRefresh = vi.fn()
    const mockSuccessNotification = vi.fn()
    const mockToggleSelection = vi.fn()
    const mockClearSelection = vi.fn()
    const mockSetIsSelectionMode = vi.fn()

    const sampleSkill: Skill = {
        name: "TypeScript",
        mastery: "Intermediate" as Mastery,
        categoryId: "c1",
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRefresh,
            push: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            replace: vi.fn(),
            bfcacheId: "",
        })

        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
            error: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
        } as unknown as ReturnType<typeof useActionNotifications>)

        vi.mocked(useUserSelectionState).mockReturnValue({
            isSelectionMode: false,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedItems: ["TypeScript"],
            clearSelection: mockClearSelection,
            toggleSelection: mockToggleSelection,
            selectAll: vi.fn(),
            deselectAll: vi.fn(),
        } as unknown as ReturnType<typeof useUserSelectionState>)
    })

    it("initializes with default selection state and null editing skill", () => {
        const { result } = renderHook(() => useSkillsView({ cvId: "cv-1" }))

        expect(useUserSelectionState).toHaveBeenCalledTimes(1)
        expect(result.current.isSelectionMode).toBe(false)
        expect(result.current.selectedSkills).toEqual(["TypeScript"])
        expect(result.current.editingSkill).toBeNull()
    })

    it("does nothing on update if editingSkill is null", async () => {
        const { result } = renderHook(() => useSkillsView({ cvId: "cv-1" }))

        await act(async () => {
            await result.current.handleUpdateSkill("Advanced" as Mastery)
        })

        expect(updateCvSkill).not.toHaveBeenCalled()
        expect(mockSuccessNotification).not.toHaveBeenCalled()
    })

    it("handles successful skill update, sends correct parameters and cleans up state", async () => {
        vi.mocked(updateCvSkill).mockResolvedValueOnce({
            updateCvSkill: { success: true },
        } as unknown as Awaited<ReturnType<typeof updateCvSkill>>)

        const { result } = renderHook(() => useSkillsView({ cvId: "cv-1" }))

        act(() => {
            result.current.setEditingSkill(sampleSkill)
        })

        expect(result.current.editingSkill).toEqual(sampleSkill)

        await act(async () => {
            await result.current.handleUpdateSkill("Advanced" as Mastery)
        })

        expect(updateCvSkill).toHaveBeenCalledWith({
            cvId: "cv-1",
            name: "TypeScript",
            mastery: "Advanced",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("updated")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.editingSkill).toBeNull()
    })
})
