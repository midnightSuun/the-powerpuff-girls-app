import { act, renderHook } from "@testing-library/react"
import type { SyntheticEvent } from "react"
import { describe, expect, it, vi } from "vitest"

import { useUpdateCvModal } from "../use-update-cv-modal"

describe("useUpdateCvModal", () => {
    const mockCv = {
        id: "cv-1",
        name: "John Doe",
        education: "MIT",
        description: "Software Engineer",
    }

    it("initializes with values from CV when provided", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useUpdateCvModal({ cv: mockCv, onUpdate }),
        )

        expect(result.current.name).toBe("John Doe")
        expect(result.current.education).toBe("MIT")
        expect(result.current.description).toBe("Software Engineer")
        expect(result.current.hasSubmitted).toBe(false)
        expect(result.current.isValid).toBe(true)
    })

    it("initializes with empty values when CV is null", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useUpdateCvModal({ cv: null, onUpdate }),
        )

        expect(result.current.name).toBe("")
        expect(result.current.education).toBe("")
        expect(result.current.description).toBe("")
        expect(result.current.hasSubmitted).toBe(false)
        expect(result.current.isValid).toBe(false)
    })

    it("validates fields correctly and updates input values", () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useUpdateCvModal({ cv: null, onUpdate }),
        )

        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setName("   ")
            result.current.setEducation("Stanford")
            result.current.setDescription("Developer")
        })

        expect(result.current.isValid).toBe(false)

        act(() => {
            result.current.setName("Jane Doe")
        })

        expect(result.current.isValid).toBe(true)
    })

    it("prevents submission and sets hasSubmitted to true if form is invalid", async () => {
        const onUpdate = vi.fn()
        const { result } = renderHook(() =>
            useUpdateCvModal({ cv: null, onUpdate }),
        )

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(result.current.hasSubmitted).toBe(true)
        expect(onUpdate).not.toHaveBeenCalled()
    })

    it("successfully submits updated data when form is valid", async () => {
        const onUpdate = vi.fn().mockResolvedValue(undefined)
        const { result } = renderHook(() =>
            useUpdateCvModal({ cv: mockCv, onUpdate }),
        )

        act(() => {
            result.current.setName("John Updated")
        })

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(result.current.hasSubmitted).toBe(true)
        expect(onUpdate).toHaveBeenCalledTimes(1)
        expect(onUpdate).toHaveBeenCalledWith({
            name: "John Updated",
            education: "MIT",
            description: "Software Engineer",
        })
    })
})
