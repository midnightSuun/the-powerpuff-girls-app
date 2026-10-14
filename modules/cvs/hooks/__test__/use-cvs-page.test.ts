import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { sortByLocale } from "@/lib/sort"

import { createCvAction } from "../../api/create-cv"
import { deleteCvAction } from "../../api/delete-cv"
import { updateCvAction } from "../../api/update-cv"
import { CvItem } from "../../types"
import { useCvsPage } from "../use-cvs-page"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("next-intl", () => ({
    useLocale: vi.fn(),
    useTranslations: vi.fn(),
}))

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/lib/sort", () => ({
    sortByLocale: vi.fn((items) => items),
}))

vi.mock("../../api/create-cv", () => ({
    createCvAction: vi.fn(),
}))

vi.mock("../../api/update-cv", () => ({
    updateCvAction: vi.fn(),
}))

vi.mock("../../api/delete-cv", () => ({
    deleteCvAction: vi.fn(),
}))

describe("useCvsPage", () => {
    const mockRefresh = vi.fn()
    const mockT = vi.fn((key: string) => key)
    const mockSuccessNotification = vi.fn()

    const mockCvs: CvItem[] = [
        {
            id: "cv-1",
            name: "Alice",
            education: "MIT",
            description: "Dev",
            projects: [],
            skills: [],
            languages: [],
        },
        {
            id: "cv-2",
            name: "Bob",
            education: "Stanford",
            description: "Lead",
            projects: [],
            skills: [],
            languages: [],
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRefresh,
        } as unknown as ReturnType<typeof useRouter>)
        vi.mocked(useLocale).mockReturnValue("en")
        vi.mocked(useTranslations).mockReturnValue(
            mockT as unknown as ReturnType<typeof useTranslations>,
        )
        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
        } as unknown as ReturnType<typeof useActionNotifications>)
    })

    it("initializes with default states and sorts CVs", () => {
        const { result } = renderHook(() =>
            useCvsPage({ initialCvs: mockCvs, targetUserId: "user-1" }),
        )

        expect(result.current.sortedCvs).toEqual(mockCvs)
        expect(result.current.sortOrder).toBe("asc")
        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingCv).toBeNull()
        expect(result.current.deletingCv).toBeNull()
        expect(result.current.activeMenuId).toBeNull()
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.error).toBeNull()
        expect(sortByLocale).toHaveBeenCalledWith(
            mockCvs,
            expect.any(Function),
            "asc",
            "en",
        )
    })

    it("toggles sort order between asc and desc", () => {
        const { result } = renderHook(() => useCvsPage({ initialCvs: mockCvs }))

        expect(result.current.sortOrder).toBe("asc")

        act(() => {
            result.current.toggleSort()
        })
        expect(result.current.sortOrder).toBe("desc")

        act(() => {
            result.current.toggleSort()
        })
        expect(result.current.sortOrder).toBe("asc")
    })

    it("successfully creates a CV and refreshes data", async () => {
        vi.mocked(createCvAction).mockResolvedValue({ error: null } as never)

        const { result } = renderHook(() =>
            useCvsPage({ initialCvs: mockCvs, targetUserId: "user-1" }),
        )

        await act(async () => {
            await result.current.handleCreate({
                name: "Charlie",
                education: "Harvard",
                description: "Junior",
            })
        })

        expect(createCvAction).toHaveBeenCalledTimes(1)
        expect(createCvAction).toHaveBeenCalledWith({
            name: "Charlie",
            education: "Harvard",
            description: "Junior",
            userId: "user-1",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("created")
        expect(result.current.isCreateOpen).toBe(false)
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles errors returned from createCvAction", async () => {
        vi.mocked(createCvAction).mockResolvedValue({
            error: "Creation failed",
        } as never)

        const { result } = renderHook(() => useCvsPage({ initialCvs: mockCvs }))

        await act(async () => {
            await result.current.handleCreate({
                name: "Charlie",
                education: "Harvard",
                description: "Junior",
            })
        })

        expect(result.current.error).toBe("createError")
        expect(mockSuccessNotification).not.toHaveBeenCalled()
        expect(mockRefresh).not.toHaveBeenCalled()
    })

    it("successfully updates an existing CV", async () => {
        vi.mocked(updateCvAction).mockResolvedValue({ error: null } as never)

        const { result } = renderHook(() => useCvsPage({ initialCvs: mockCvs }))

        act(() => {
            result.current.setEditingCv(mockCvs[0])
        })

        await act(async () => {
            await result.current.handleUpdate({
                name: "Alice Updated",
                education: "MIT",
                description: "Senior",
            })
        })

        expect(updateCvAction).toHaveBeenCalledTimes(1)
        expect(updateCvAction).toHaveBeenCalledWith({
            cvId: "cv-1",
            name: "Alice Updated",
            education: "MIT",
            description: "Senior",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("updated")
        expect(result.current.editingCv).toBeNull()
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles update errors gracefully", async () => {
        vi.mocked(updateCvAction).mockResolvedValue({
            error: "Update failed",
        } as never)

        const { result } = renderHook(() => useCvsPage({ initialCvs: mockCvs }))

        act(() => {
            result.current.setEditingCv(mockCvs[0])
        })

        await act(async () => {
            await result.current.handleUpdate({
                name: "Alice Updated",
                education: "MIT",
                description: "Senior",
            })
        })

        expect(result.current.error).toBe("updateError")
        expect(mockSuccessNotification).not.toHaveBeenCalled()
    })

    it("successfully deletes a CV", async () => {
        vi.mocked(deleteCvAction).mockResolvedValue({ error: null } as never)

        const { result } = renderHook(() => useCvsPage({ initialCvs: mockCvs }))

        act(() => {
            result.current.setDeletingCv(mockCvs[0])
        })

        await act(async () => {
            await result.current.handleDelete()
        })

        expect(deleteCvAction).toHaveBeenCalledTimes(1)
        expect(deleteCvAction).toHaveBeenCalledWith("cv-1")
        expect(mockSuccessNotification).toHaveBeenCalledWith("deleted")
        expect(result.current.deletingCv).toBeNull()
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.error).toBeNull()
    })

    it("handles deletion errors gracefully", async () => {
        vi.mocked(deleteCvAction).mockResolvedValue({
            error: "Delete failed",
        } as never)

        const { result } = renderHook(() => useCvsPage({ initialCvs: mockCvs }))

        act(() => {
            result.current.setDeletingCv(mockCvs[0])
        })

        await act(async () => {
            await result.current.handleDelete()
        })

        expect(result.current.error).toBe("deleteError")
        expect(mockSuccessNotification).not.toHaveBeenCalled()
    })
})
