import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { CvItem } from "../../types"
import { useCvDetailsForm } from "../use-cv-details-form"

describe("useCvDetailsForm", () => {
    const mockCv: CvItem = {
        id: "cv-1",
        name: "John Doe",
        education: "MIT",
        description: "Software Engineer",
        projects: [],
        skills: [],
        languages: [],
    }

    const updateErrorText = "Failed to update CV"

    it("initializes with values from CV and default states", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        expect(result.current.name).toBe("John Doe")
        expect(result.current.education).toBe("MIT")
        expect(result.current.description).toBe("Software Engineer")
        expect(result.current.isDirty).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it("detects changes and sets isDirty to true", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        expect(result.current.isDirty).toBe(false)

        act(() => {
            result.current.setName("Jane Doe")
        })

        expect(result.current.isDirty).toBe(true)
    })

    it("successfully submits updated form data and handles submission states", async () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined)
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        act(() => {
            result.current.setName("John Updated")
        })

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent

        let submitPromise: Promise<void>
        act(() => {
            submitPromise = result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(result.current.isSubmitting).toBe(true)
        expect(result.current.error).toBeNull()

        await act(async () => {
            await submitPromise
        })

        expect(result.current.isSubmitting).toBe(false)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith({
            name: "John Updated",
            education: "MIT",
            description: "Software Engineer",
        })
        expect(result.current.error).toBeNull()
    })

    it("handles errors during submission and sets error text", async () => {
        const onUpdate = vi.fn().mockRejectedValue(new Error("Network error"))
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.error).toBe(updateErrorText)
    })

    it("fails validation when name is empty or too long", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent

        act(() => {
            result.current.setName("")
        })
        act(() => {
            result.current.handleSubmit(mockEvent)
        })

        expect(result.current.fieldErrors.name).toBe("Name is required")
        expect(onUpdate).not.toHaveBeenCalled()

        act(() => {
            result.current.setName("a".repeat(256))
        })
        act(() => {
            result.current.handleSubmit(mockEvent)
        })

        expect(result.current.fieldErrors.name).toBe(
            "Name must be 255 characters or less",
        )
    })

    it("fails validation when education is empty or too long", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent

        act(() => {
            result.current.setEducation("")
        })
        act(() => {
            result.current.handleSubmit(mockEvent)
        })
        expect(result.current.fieldErrors.education).toBe(
            "Education is required",
        )

        act(() => {
            result.current.setEducation("a".repeat(256))
        })
        act(() => {
            result.current.handleSubmit(mockEvent)
        })
        expect(result.current.fieldErrors.education).toBe(
            "Education must be 255 characters or less",
        )
    })

    it("fails validation when description is empty", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useCvDetailsForm({
                cv: mockCv,
                onUpdate,
                updateErrorText,
            }),
        )

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent

        act(() => {
            result.current.setDescription("")
        })
        act(() => {
            result.current.handleSubmit(mockEvent)
        })

        expect(result.current.fieldErrors.description).toBe(
            "Description is required",
        )
        expect(onUpdate).not.toHaveBeenCalled()
    })
})
