import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { deleteCvSkills } from "@/modules/skills/api/skills"

import { useDeleteSkillsButton } from "../hooks/use-delete-skills-button"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/modules/skills/api/skills", () => ({
    deleteCvSkills: vi.fn(),
}))

describe("useDeleteSkillsButton", () => {
    const mockRefresh = vi.fn()
    const mockSuccessNotification = vi.fn()
    const mockToggleSelectionMode = vi.fn()
    const mockClearSelection = vi.fn()

    const defaultProps = {
        cvId: "cv-1",
        selectedSkills: ["TypeScript", "React"],
        onToggleSelectionMode: mockToggleSelectionMode,
        onClearSelection: mockClearSelection,
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

        vi.mocked(useTranslations).mockReturnValue(
            ((key: string) => key) as unknown as ReturnType<
                typeof useTranslations
            >,
        )
    })

    it("initializes with correct default state and detects selected skills", () => {
        const { result } = renderHook(() => useDeleteSkillsButton(defaultProps))

        expect(result.current.isModalOpen).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.hasSelected).toBe(true)
    })

    it("reports hasSelected as false when no skills are selected", () => {
        const { result } = renderHook(() =>
            useDeleteSkillsButton({
                ...defaultProps,
                selectedSkills: [],
            }),
        )

        expect(result.current.hasSelected).toBe(false)
    })

    it("handles cancel action by clearing selection and toggling mode", () => {
        const { result } = renderHook(() => useDeleteSkillsButton(defaultProps))

        act(() => {
            result.current.handleCancel()
        })

        expect(mockClearSelection).toHaveBeenCalledTimes(1)
        expect(mockToggleSelectionMode).toHaveBeenCalledWith(false)
    })

    it("handles successful deletion confirmation and cleanup", async () => {
        vi.mocked(deleteCvSkills).mockResolvedValueOnce({
            deleteCvSkill: { success: true },
        } as unknown as Awaited<ReturnType<typeof deleteCvSkills>>)

        const { result } = renderHook(() => useDeleteSkillsButton(defaultProps))

        // Открываем модальное окно
        act(() => {
            result.current.setIsModalOpen(true)
        })

        expect(result.current.isModalOpen).toBe(true)

        // Подтверждаем удаление
        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteCvSkills).toHaveBeenCalledWith({
            cvId: "cv-1",
            name: ["TypeScript", "React"],
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("deleted")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(mockClearSelection).toHaveBeenCalledTimes(1)
        expect(mockToggleSelectionMode).toHaveBeenCalledWith(false)
        expect(result.current.isModalOpen).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
    })
})
