import { act, renderHook } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { isNameDuplicate } from "@/lib/validate-unique-name"

import { useCreateSkillAdminModal } from "../hooks/use-create-skill-admin-modal"

vi.mock("next-intl", () => ({
    useTranslations: vi.fn(),
}))

vi.mock("@/lib/validate-unique-name", () => ({
    normalizeName: vi.fn((val: string) => val.trim()),
    isNameDuplicate: vi.fn(),
}))

describe("useCreateSkillAdminModal", () => {
    const mockOnClose = vi.fn()
    const mockOnCreate = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useTranslations).mockReturnValue(
            ((key: string) => key) as unknown as ReturnType<
                typeof useTranslations
            >,
        )
        vi.mocked(isNameDuplicate).mockReturnValue(false)
    })

    it("initializes with default values", () => {
        const { result } = renderHook(() =>
            useCreateSkillAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingSkillNames: ["TypeScript"],
                onCreate: mockOnCreate,
            }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.categoryId).toBe("")
        expect(result.current.inlineError).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
    })

    it("resets state when modal transitions from open to closed", () => {
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useCreateSkillAdminModal({
                    isOpen,
                    onClose: mockOnClose,
                    existingSkillNames: [],
                    onCreate: mockOnCreate,
                }),
            {
                initialProps: { isOpen: true },
            },
        )

        act(() => {
            result.current.setName("React")
            result.current.setCategoryId("c1")
        })

        expect(result.current.name).toBe("React")
        expect(result.current.categoryId).toBe("c1")

        rerender({ isOpen: false })

        expect(result.current.name).toBe("")
        expect(result.current.categoryId).toBe("")
        expect(result.current.error).toBeNull()
    })

    it("detects duplicate names and provides inline error", () => {
        vi.mocked(isNameDuplicate).mockReturnValue(true)

        const { result } = renderHook(() =>
            useCreateSkillAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingSkillNames: ["TypeScript"],
                onCreate: mockOnCreate,
            }),
        )

        act(() => {
            result.current.setName("TypeScript")
            result.current.setCategoryId("c1")
        })

        expect(result.current.inlineError).toBe("duplicate")
        expect(result.current.isValid).toBe(false)
    })

    it("validates form correctly when inputs are valid and unique", () => {
        vi.mocked(isNameDuplicate).mockReturnValue(false)

        const { result } = renderHook(() =>
            useCreateSkillAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingSkillNames: ["TypeScript"],
                onCreate: mockOnCreate,
            }),
        )

        act(() => {
            result.current.setName("React")
            result.current.setCategoryId("c1")
        })

        expect(result.current.inlineError).toBeNull()
        expect(result.current.isValid).toBe(true)
    })

    it("handles successful skill creation", async () => {
        mockOnCreate.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useCreateSkillAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingSkillNames: [],
                onCreate: mockOnCreate,
            }),
        )

        act(() => {
            result.current.setName("React")
            result.current.setCategoryId("c1")
        })

        const preventDefault = vi.fn()

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault,
            } as unknown as React.SyntheticEvent)
        })

        expect(preventDefault).toHaveBeenCalledTimes(1)
        expect(mockOnCreate).toHaveBeenCalledWith({
            name: "React",
            categoryId: "c1",
        })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles creation error gracefully", async () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {})

        mockOnCreate.mockRejectedValueOnce(new Error("Server error"))

        const { result } = renderHook(() =>
            useCreateSkillAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingSkillNames: [],
                onCreate: mockOnCreate,
            }),
        )

        act(() => {
            result.current.setName("React")
            result.current.setCategoryId("c1")
        })

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(mockOnCreate).toHaveBeenCalledWith({
            name: "React",
            categoryId: "c1",
        })
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("createError")

        consoleErrorSpy.mockRestore()
    })

    it("does nothing on submit if form is invalid or already submitting", async () => {
        const { result } = renderHook(() =>
            useCreateSkillAdminModal({
                isOpen: true,
                onClose: mockOnClose,
                existingSkillNames: [],
                onCreate: mockOnCreate,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn(),
            } as unknown as React.SyntheticEvent)
        })

        expect(mockOnCreate).not.toHaveBeenCalled()
    })
})
