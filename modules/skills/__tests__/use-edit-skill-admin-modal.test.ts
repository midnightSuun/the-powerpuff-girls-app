import { act, renderHook } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AdminSkillItem } from "../hooks/use-edit-skill-admin-modal"
import { useEditSkillAdminModal } from "../hooks/use-edit-skill-admin-modal"

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

describe("useEditSkillAdminModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const sampleSkill: AdminSkillItem = {
        id: "1",
        name: "TypeScript",
        category: "Programming",
        categoryId: "c1",
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useTranslations).mockReturnValue(
            ((key: string) => key) as unknown as ReturnType<
                typeof useTranslations
            >,
        )
    })

    it("initializes with skill values when provided", () => {
        const { result } = renderHook(
            ({ skill }) =>
                useEditSkillAdminModal({
                    skill,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            {
                initialProps: { skill: sampleSkill as AdminSkillItem | null },
            },
        )

        expect(result.current.name).toBe("TypeScript")
        expect(result.current.categoryId).toBe("c1")
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(true)
    })

    it("updates internal state when skill prop changes", () => {
        const { result, rerender } = renderHook(
            ({ skill }) =>
                useEditSkillAdminModal({
                    skill,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            {
                initialProps: { skill: sampleSkill as AdminSkillItem | null },
            },
        )

        expect(result.current.name).toBe("TypeScript")

        const updatedSkill: AdminSkillItem = {
            id: "2",
            name: "React",
            category: "Frontend",
            categoryId: "c2",
        }

        act(() => {
            rerender({ skill: updatedSkill })
        })

        expect(result.current.name).toBe("React")
        expect(result.current.categoryId).toBe("c2")
    })

    it("validates form correctly based on trimmed name and categoryId", () => {
        const { result } = renderHook(
            ({ skill }) =>
                useEditSkillAdminModal({
                    skill,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            {
                initialProps: { skill: sampleSkill as AdminSkillItem | null },
            },
        )

        act(() => {
            result.current.setName("   ")
        })

        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setName("JavaScript")
        })

        expect(result.current.isValid).toBe(true)
    })

    it("handles successful skill update", async () => {
        mockOnUpdate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(
            ({ skill }) =>
                useEditSkillAdminModal({
                    skill,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            {
                initialProps: { skill: sampleSkill as AdminSkillItem | null },
            },
        )

        act(() => {
            result.current.setName("TypeScript Advanced")
        })

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnUpdate).toHaveBeenCalledWith("1", {
            name: "TypeScript Advanced",
            categoryId: "c1",
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles update error gracefully and sets error state", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        mockOnUpdate.mockRejectedValueOnce(new Error("Update failed"))

        const { result } = renderHook(
            ({ skill }) =>
                useEditSkillAdminModal({
                    skill,
                    onClose: mockOnClose,
                    onUpdate: mockOnUpdate,
                }),
            {
                initialProps: { skill: sampleSkill as AdminSkillItem | null },
            },
        )

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(mockOnUpdate).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("updateError")
        expect(result.current.isSubmitting).toBe(false)

        consoleErrorSpy.mockRestore()
    })

    it("does nothing on submit if skill is null or form is invalid", async () => {
        const { result } = renderHook(() =>
            useEditSkillAdminModal({
                skill: null,
                onClose: mockOnClose,
                onUpdate: mockOnUpdate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(mockOnUpdate).not.toHaveBeenCalled()
    })
})
