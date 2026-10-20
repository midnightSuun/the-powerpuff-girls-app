import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
import {
    createAdminDepartment,
    deleteAdminDepartment,
    updateAdminDepartment,
} from "@/modules/departments/api/departments"

export interface AdminDepartmentItem {
    id: string
    name: string
}

interface UseAdminDepartmentsViewProps {
    initialDepartments: AdminDepartmentItem[]
}

export function useAdminDepartmentsView({
    initialDepartments,
}: UseAdminDepartmentsViewProps) {
    const crud = useAdminCrudState(initialDepartments)

    const handleCreate = async (data: { name: string }) => {
        await createAdminDepartment({ name: data.name })
        crud.setIsCreateOpen(false)
    }

    const handleUpdate = async (id: string, data: { name: string }) => {
        await updateAdminDepartment({ departmentId: id, name: data.name })
        crud.setEditingItem(null)
    }

    const handleDeleteConfirm = async () => {
        if (!crud.deletingItem) return
        await deleteAdminDepartment({ departmentId: crud.deletingItem.id })
        crud.setDeletingItem(null)
    }

    return {
        departments: crud.items,
        isCreateOpen: crud.isCreateOpen,
        setIsCreateOpen: crud.setIsCreateOpen,
        editingDepartment: crud.editingItem,
        setEditingDepartment: crud.setEditingItem,
        deletingDepartment: crud.deletingItem,
        setDeletingDepartment: crud.setDeletingItem,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
