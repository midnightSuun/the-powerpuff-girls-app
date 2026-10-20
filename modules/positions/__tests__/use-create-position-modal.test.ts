import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { isNameDuplicate, normalizeName } from "@/lib/validate-unique-name"

import { useCreatePositionModal } from "../hooks/use-create-position-modal"

vi.mock("@/lib/validate-unique-name", () => ({
    normalizeName: vi.fn((val: string) => val.trim()),
    isNameDuplicate: vi.fn(() => false),
}))

describe("useCreatePositionModal", () => {
    const mockOnClose = vi.fn()
    const mockOnSubmit = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(isNameDuplicate).mockReturnValue(false)
    })

    it("initializes with default values", () => {
        const { result } = renderHook(() =>
            useCreatePositionModal({
                isOpen: true,
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.inlineError).toBeNull()
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.isValid).toBe(false)
    })

    it("resets state when modal transitions from open to closed", () => {
        const { result, rerender } = renderHook(
            ({ isOpen }) =>
                useCreatePositionModal({
                    isOpen,
                    onClose: mockOnClose,
                    onSubmit: mockOnSubmit,
                }),
            { initialProps: { isOpen: true } },
        )

        act(() => {
            result.current.setName("   Developer   ")
        })
        expect(result.current.name).toBe("   Developer   ")

        rerender({ isOpen: false })

        expect(result.current.name).toBe("")
        expect(result.current.error).toBeNull()
    })

    it("validates uniqueness and sets inlineError when name is duplicate", () => {
        vi.mocked(isNameDuplicate).mockReturnValue(true)

        const { result } = renderHook(() =>
            useCreatePositionModal({
                isOpen: true,
                existingNames: ["Developer"],
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        act(() => {
            result.current.setName("Developer")
        })

        expect(normalizeName).toHaveBeenCalledWith("Developer")
        expect(isNameDuplicate).toHaveBeenCalledWith("Developer", ["Developer"])
        expect(result.current.inlineError).toBe("alreadyExists")
        expect(result.current.isValid).toBe(false)
    })

    it("handles successful submission, resets name, and closes modal", async () => {
        mockOnSubmit.mockResolvedValueOnce(undefined)

        const { result } = renderHook(() =>
            useCreatePositionModal({
                isOpen: true,
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        act(() => {
            result.current.setName("   QA Engineer   ")
        })
        expect(result.current.isValid).toBe(true)

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnSubmit).toHaveBeenCalledWith({ name: "QA Engineer" })
        expect(result.current.name).toBe("")
        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
    })

    it("handles submission error correctly when onSubmit throws an Error", async () => {
        const customError = new Error("Creation failed on server")
        mockOnSubmit.mockRejectedValueOnce(customError)

        const { result } = renderHook(() =>
            useCreatePositionModal({
                isOpen: true,
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        act(() => {
            result.current.setName("DevOps")
        })
        expect(result.current.isValid).toBe(true)

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("Creation failed on server")
        expect(result.current.isSubmitting).toBe(false)
    })

    it("falls back to default error message when non-Error object is thrown during submission", async () => {
        mockOnSubmit.mockRejectedValueOnce("String error")

        const { result } = renderHook(() =>
            useCreatePositionModal({
                isOpen: true,
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        act(() => {
            result.current.setName("DevOps")
        })
        expect(result.current.isValid).toBe(true)

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnSubmit).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
        expect(result.current.error).toBe("Failed to create position")
        expect(result.current.isSubmitting).toBe(false)
    })

    it("does not call onSubmit if form is invalid", async () => {
        const { result } = renderHook(() =>
            useCreatePositionModal({
                isOpen: true,
                onClose: mockOnClose,
                onSubmit: mockOnSubmit,
            }),
        )

        await act(async () => {
            await result.current.handleSubmit()
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })
})
