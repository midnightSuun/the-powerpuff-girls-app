import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
import {
    createAdminSkill,
    deleteAdminSkill,
    updateAdminSkill,
} from "@/modules/skills/api/admin-skills"

import { useAdminSkillsView } from "../hooks/use-admin-skills-view"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/hooks/use-admin-crud-state", () => ({
    useAdminCrudState: vi.fn(),
}))

vi.mock("@/modules/skills/api/admin-skills", () => ({
    createAdminSkill: vi.fn(),
    updateAdminSkill: vi.fn(),
    deleteAdminSkill: vi.fn(),
}))

describe("useAdminSkillsView", () => {
    const mockSuccessNotification = vi.fn()
    const mockAddItem = vi.fn()
    const mockUpdateItem = vi.fn()
    const mockRemoveItem = vi.fn()
    const mockSetIsCreateOpen = vi.fn()
    const mockSetEditingItem = vi.fn()
    const mockSetDeletingItem = vi.fn()

    const initialSkills = [
        {
            id: "1",
            name: "TypeScript",
            category: "Programming",
            categoryId: "c1",
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockSuccessNotification,
            error: vi.fn(),
            info: vi.fn(),
            warning: vi.fn(),
        } as unknown as ReturnType<typeof useActionNotifications>)

        vi.mocked(useAdminCrudState).mockReturnValue({
            items: initialSkills,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingItem: null,
            setEditingItem: mockSetEditingItem,
            deletingItem: null,
            setDeletingItem: mockSetDeletingItem,
            addItem: mockAddItem,
            updateItem: mockUpdateItem,
            removeItem: mockRemoveItem,
        } as unknown as ReturnType<typeof useAdminCrudState>)
    })

    it("initializes with CRUD state and returns expected view interface", () => {
        const { result } = renderHook(() =>
            useAdminSkillsView({ initialSkills }),
        )

        expect(useAdminCrudState).toHaveBeenCalledWith(initialSkills)
        expect(result.current.skills).toEqual(initialSkills)
        expect(result.current.isCreateOpen).toBe(false)
        expect(result.current.editingSkill).toBeNull()
        expect(result.current.deletingSkill).toBeNull()
    })

    it("handles skill creation successfully", async () => {
        const createdSkillResponse = {
            id: "2",
            name: "React",
            category: { id: "c1", name: "Programming" },
        }

        vi.mocked(createAdminSkill).mockResolvedValueOnce(
            createdSkillResponse as unknown as Awaited<
                ReturnType<typeof createAdminSkill>
            >,
        )

        const { result } = renderHook(() =>
            useAdminSkillsView({ initialSkills }),
        )

        await act(async () => {
            await result.current.handleCreate({
                name: "React",
                categoryId: "c1",
            })
        })

        expect(createAdminSkill).toHaveBeenCalledWith({
            name: "React",
            categoryId: "c1",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("created")
        expect(mockAddItem).toHaveBeenCalledWith({
            id: "2",
            name: "React",
            category: "Programming",
            categoryId: "c1",
        })
    })

    it("handles skill update successfully", async () => {
        const updatedSkillResponse = {
            id: "1",
            name: "TypeScript.js",
            category: { id: "c1", name: "Programming" },
        }

        vi.mocked(updateAdminSkill).mockResolvedValueOnce(
            updatedSkillResponse as unknown as Awaited<
                ReturnType<typeof updateAdminSkill>
            >,
        )

        const { result } = renderHook(() =>
            useAdminSkillsView({ initialSkills }),
        )

        await act(async () => {
            await result.current.handleUpdate("1", {
                name: "TypeScript.js",
                categoryId: "c1",
            })
        })

        expect(updateAdminSkill).toHaveBeenCalledWith({
            skillId: "1",
            name: "TypeScript.js",
            categoryId: "c1",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("updated")
        expect(mockUpdateItem).toHaveBeenCalledWith("1", {
            name: "TypeScript.js",
            category: "Programming",
            categoryId: "c1",
        })
    })

    it("does nothing on delete confirm if deletingItem is missing", async () => {
        const { result } = renderHook(() =>
            useAdminSkillsView({ initialSkills }),
        )

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteAdminSkill).not.toHaveBeenCalled()
        expect(mockRemoveItem).not.toHaveBeenCalled()
    })

    it("handles skill deletion confirmation successfully", async () => {
        vi.mocked(useAdminCrudState).mockReturnValue({
            items: initialSkills,
            isCreateOpen: false,
            setIsCreateOpen: mockSetIsCreateOpen,
            editingItem: null,
            setEditingItem: mockSetEditingItem,
            deletingItem: { id: "1", name: "TypeScript" },
            setDeletingItem: mockSetDeletingItem,
            addItem: mockAddItem,
            updateItem: mockUpdateItem,
            removeItem: mockRemoveItem,
        } as unknown as ReturnType<typeof useAdminCrudState>)

        vi.mocked(deleteAdminSkill).mockResolvedValueOnce({
            success: true,
        } as unknown as Awaited<ReturnType<typeof deleteAdminSkill>>)

        const { result } = renderHook(() =>
            useAdminSkillsView({ initialSkills }),
        )

        await act(async () => {
            await result.current.handleDeleteConfirm()
        })

        expect(deleteAdminSkill).toHaveBeenCalledWith({
            skillId: "1",
        })
        expect(mockSuccessNotification).toHaveBeenCalledWith("deleted")
        expect(mockRemoveItem).toHaveBeenCalledWith("1")
    })
})
