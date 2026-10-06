import { useState } from "react"

import {
    createAdminPosition,
    deleteAdminPosition,
    updateAdminPosition,
} from "@/modules/positions/api/positions"

export interface AdminPositionItem {
    id: string
    name: string
}

interface UseAdminPositionsViewProps {
    initialPositions: AdminPositionItem[]
}

export function useAdminPositionsView({
    initialPositions,
}: UseAdminPositionsViewProps) {
    const [prevInitial, setPrevInitial] = useState(initialPositions)
    const [positions, setPositions] =
        useState<AdminPositionItem[]>(initialPositions)

    if (prevInitial !== initialPositions) {
        setPrevInitial(initialPositions)
        setPositions(initialPositions)
    }

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingPosition, setEditingPosition] =
        useState<AdminPositionItem | null>(null)
    const [deletingPosition, setDeletingPosition] =
        useState<AdminPositionItem | null>(null)

    const handleCreate = async (data: { name: string }) => {
        await createAdminPosition({ name: data.name })
        setIsCreateOpen(false)
    }

    const handleUpdate = async (id: string, data: { name: string }) => {
        await updateAdminPosition({ positionId: id, name: data.name })
        setEditingPosition(null)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingPosition) return
        await deleteAdminPosition({ positionId: deletingPosition.id })
        setDeletingPosition(null)
    }

    return {
        positions,
        isCreateOpen,
        setIsCreateOpen,
        editingPosition,
        setEditingPosition,
        deletingPosition,
        setDeletingPosition,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
