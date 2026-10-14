import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useCreateCv } from "../use-сreate-сv"

describe("useCreateCv", () => {
    it("initializes with empty fields and invalid state", () => {
        const onCreate = vi.fn()
        const { result } = renderHook(() => useCreateCv({ onCreate }))

        expect(result.current.name).toBe("")
        expect(result.current.education).toBe("")
        expect(result.current.description).toBe("")
        expect(result.current.isValid).toBe(false)
    })

    it("updates field values correctly", () => {
        const onCreate = vi.fn()
        const { result } = renderHook(() => useCreateCv({ onCreate }))

        act(() => {
            result.current.setName("John Doe")
            result.current.setEducation("MIT")
            result.current.setDescription("Software Engineer")
        })

        expect(result.current.name).toBe("John Doe")
        expect(result.current.education).toBe("MIT")
        expect(result.current.description).toBe("Software Engineer")
        expect(result.current.isValid).toBe(true)
    })

    it("does not call onCreate on submit if fields are invalid or empty", async () => {
        const onCreate = vi.fn()
        const { result } = renderHook(() => useCreateCv({ onCreate }))

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(onCreate).not.toHaveBeenCalled()
    })

    it("calls onCreate with form data on submit when valid", async () => {
        const onCreate = vi.fn().mockResolvedValue(undefined)
        const { result } = renderHook(() => useCreateCv({ onCreate }))

        act(() => {
            result.current.setName("John Doe")
            result.current.setEducation("MIT")
            result.current.setDescription("Software Engineer")
        })

        const mockEvent = {
            preventDefault: vi.fn(),
        } as unknown as React.SyntheticEvent

        await act(async () => {
            await result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(onCreate).toHaveBeenCalledTimes(1)
        expect(onCreate).toHaveBeenCalledWith({
            name: "John Doe",
            education: "MIT",
            description: "Software Engineer",
        })
    })
})
