import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"

import { useEditSkillModal } from "../hooks/use-edit-skill-modal"

const { mockUseTranslations, mockUseBodyScrollLock } = vi.hoisted(() => ({
    mockUseTranslations: vi.fn(),
    mockUseBodyScrollLock: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: mockUseTranslations,
}))

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: mockUseBodyScrollLock,
}))

describe("useEditSkillModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        skillName: "TypeScript",
        currentMastery: "Intermediate" as Mastery,
        onUpdate: mockOnUpdate,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockUseTranslations.mockReturnValue((key: string) => key)
    })

    it("initializes with current mastery value and activates body scroll lock", () => {
        const { result } = renderHook(() => useEditSkillModal(defaultProps))

        expect(result.current.mastery).toBe("Intermediate")
        expect(result.current.isValid).toBe(true)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(mockUseBodyScrollLock).toHaveBeenCalledWith(true)
    })

    it("updates mastery and clears error correctly", () => {
        const { result } = renderHook(() => useEditSkillModal(defaultProps))

        act(() => {
            result.current.setMastery("Advanced" as Mastery)
        })

        expect(result.current.mastery).toBe("Advanced")
        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.setMastery("" as Mastery)
        })

        expect(result.current.mastery).toBe("")
        expect(result.current.isValid).toBe(false)
    })

    it("sets validation error when submitting with empty mastery", async () => {
        const { result } = renderHook(() =>
            useEditSkillModal({
                ...defaultProps,
                currentMastery: "" as Mastery,
            }),
        )

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(preventDefault).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBe("errors.masteryRequired")
        expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it("handles successful skill update and closes modal", async () => {
        mockOnUpdate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() => useEditSkillModal(defaultProps))

        act(() => {
            result.current.setMastery("Advanced" as Mastery)
        })

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(mockOnUpdate).toHaveBeenCalledWith("Advanced")
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("resets mastery and error when skillName changes while open", () => {
        const { result, rerender } = renderHook(
            (props) => useEditSkillModal(props),
            { initialProps: defaultProps },
        )

        // Сначала устанавливаем ошибку
        act(() => {
            result.current.setMastery("" as Mastery)
        })

        // Меняем skillName → триггерим блок на строках 43-45
        rerender({
            ...defaultProps,
            skillName: "Python",
            currentMastery: "Novice" as Mastery,
        })

        expect(result.current.mastery).toBe("Novice")
        expect(result.current.error).toBeNull()
    })

    it("resets mastery when currentMastery changes while open", () => {
        const { result, rerender } = renderHook(
            (props) => useEditSkillModal(props),
            { initialProps: defaultProps },
        )

        rerender({
            ...defaultProps,
            currentMastery: "Expert" as Mastery,
        })

        expect(result.current.mastery).toBe("Expert")
    })

    it("resets mastery when modal reopens (isOpen false → true)", () => {
        const { result, rerender } = renderHook(
            (props) => useEditSkillModal(props),
            { initialProps: { ...defaultProps, isOpen: false } },
        )

        // isOpen=false — блок не выполняется
        expect(result.current.mastery).toBe("Intermediate")

        // Открываем модал → !prevSkill.isOpen → блок выполняется
        rerender({ ...defaultProps, isOpen: true })

        expect(result.current.mastery).toBe("Intermediate")
        expect(result.current.error).toBeNull()
    })

    it("does not reset mastery when props unchanged and modal stays open", () => {
        const { result, rerender } = renderHook(
            (props) => useEditSkillModal(props),
            { initialProps: defaultProps },
        )

        act(() => {
            result.current.setMastery("Advanced" as Mastery)
        })

        // Те же пропсы → условие false → mastery не сбрасывается
        rerender({ ...defaultProps })

        expect(result.current.mastery).toBe("Advanced")
    })

    it("handles update error gracefully and sets error state", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        mockOnUpdate.mockRejectedValueOnce(new Error("Update failed"))

        const { result } = renderHook(() => useEditSkillModal(defaultProps))

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(mockOnUpdate).toHaveBeenCalledWith("Intermediate")
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("errors.failed")
        expect(result.current.isSubmitting).toBe(false)

        consoleErrorSpy.mockRestore()
    })
})
