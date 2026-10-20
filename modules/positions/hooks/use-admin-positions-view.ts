import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
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
    const crud = useAdminCrudState(initialPositions)

    const handleCreate = async (data: { name: string }) => {
        await createAdminPosition({ name: data.name })
        crud.setIsCreateOpen(false)
    }

    const handleUpdate = async (id: string, data: { name: string }) => {
        await updateAdminPosition({ positionId: id, name: data.name })
        crud.setEditingItem(null)
    }

    const handleDeleteConfirm = async () => {
        if (!crud.deletingItem) return
        await deleteAdminPosition({ positionId: crud.deletingItem.id })
        crud.setDeletingItem(null)
    }

    return {
        positions: crud.items,
        isCreateOpen: crud.isCreateOpen,
        setIsCreateOpen: crud.setIsCreateOpen,
        editingPosition: crud.editingItem,
        setEditingPosition: crud.setEditingItem,
        deletingPosition: crud.deletingItem,
        setDeletingPosition: crud.setDeletingItem,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
