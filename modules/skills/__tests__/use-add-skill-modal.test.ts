import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

import { addCvSkills } from "../api/skills"
import { useAddSkillModal } from "../hooks/use-add-skill-modal"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/hooks/use-body-scroll-lock", () => ({
    useBodyScrollLock: vi.fn(),
}))

vi.mock("../api/skills", () => ({
    addCvSkills: vi.fn(),
}))

describe("useAddSkillModal", () => {
    const mockRefresh = vi.fn()
    const mockSuccessNotification = vi.fn()
    const mockOnClose = vi.fn()

    const defaultAvailableSkills = [
        { id: "1", name: "TypeScript", categoryId: "c1" },
        { id: "2", name: "React", categoryId: "c1" },
    ]

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

    it("initializes with default values and filters unselected skills", () => {
        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                existingSkills: [{ name: "TypeScript" }],
                availableSkills: defaultAvailableSkills,
            }),
        )

        expect(result.current.isOpen).toBe(true)
        expect(result.current.selectedSkillId).toBe("")
        expect(result.current.mastery).toBe("")
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
        expect(result.current.unselectedSkills).toEqual([
            { id: "2", name: "React", categoryId: "c1" },
        ])
        expect(useBodyScrollLock).toHaveBeenCalledWith(true)
    })

    it("updates selected skill and mastery correctly and clears errors", () => {
        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                availableSkills: defaultAvailableSkills,
            }),
        )

        act(() => {
            result.current.setSelectedSkillId("1")
            result.current.setMastery("Intermediate" as Mastery)
        })

        expect(result.current.selectedSkillId).toBe("1")
        expect(result.current.mastery).toBe("Intermediate")
        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.setSelectedSkillId(null)
        })

        expect(result.current.selectedSkillId).toBe("")
        expect(result.current.isValid).toBe(false)
    })

    it("sets validation error when submitting without selecting a skill", async () => {
        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                availableSkills: defaultAvailableSkills,
            }),
        )

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(preventDefault).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBe("errors.selectSkill")
        expect(addCvSkills).not.toHaveBeenCalled()
    })

    it("sets validation error when submitting without selecting mastery", async () => {
        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                availableSkills: defaultAvailableSkills,
            }),
        )

        act(() => {
            result.current.setSelectedSkillId("1")
        })

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(result.current.error).toBe("errors.selectMastery")
        expect(addCvSkills).not.toHaveBeenCalled()
    })

    it("handles successful skill submission", async () => {
        vi.mocked(addCvSkills).mockResolvedValueOnce({
            addSkill: { id: "s-1" },
        } as unknown as Awaited<ReturnType<typeof addCvSkills>>)

        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                availableSkills: defaultAvailableSkills,
            }),
        )

        act(() => {
            result.current.setSelectedSkillId("1")
            result.current.setMastery("Advanced" as Mastery)
        })

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(addCvSkills).toHaveBeenCalledWith({
            cvId: "cv-1",
            name: "TypeScript",
            categoryId: "c1",
            mastery: "Advanced",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("created")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.selectedSkillId).toBe("")
    })

    it("handles already added skill error message correctly", async () => {
        vi.mocked(addCvSkills).mockRejectedValueOnce(
            new Error("skillHasBeenAdded already"),
        )

        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                availableSkills: defaultAvailableSkills,
            }),
        )

        act(() => {
            result.current.setSelectedSkillId("1")
            result.current.setMastery("Advanced" as Mastery)
        })

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(result.current.error).toBe("errors.alreadyAdded")
        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it("handles generic failure error correctly", async () => {
        vi.mocked(addCvSkills).mockRejectedValueOnce(new Error("Network Error"))

        const { result } = renderHook(() =>
            useAddSkillModal({
                isOpen: true,
                onClose: mockOnClose,
                cvId: "cv-1",
                availableSkills: defaultAvailableSkills,
            }),
        )

        act(() => {
            result.current.setSelectedSkillId("1")
            result.current.setMastery("Advanced" as Mastery)
        })

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(result.current.error).toBe("errors.failed")
    })
})
