import { useState } from "react"

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
    const [prevInitial, setPrevInitial] = useState(initialDepartments)
    const [departments, setDepartments] =
        useState<AdminDepartmentItem[]>(initialDepartments)

    if (prevInitial !== initialDepartments) {
        setPrevInitial(initialDepartments)
        setDepartments(initialDepartments)
    }

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingDepartment, setEditingDepartment] =
        useState<AdminDepartmentItem | null>(null)
    const [deletingDepartment, setDeletingDepartment] =
        useState<AdminDepartmentItem | null>(null)

    const handleCreate = async (data: { name: string }) => {
        await createAdminDepartment({ name: data.name })
        setIsCreateOpen(false)
    }

    const handleUpdate = async (id: string, data: { name: string }) => {
        await updateAdminDepartment({ departmentId: id, name: data.name })
        setEditingDepartment(null)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingDepartment) return
        await deleteAdminDepartment({ departmentId: deletingDepartment.id })
        setDeletingDepartment(null)
    }

    return {
        departments,
        isCreateOpen,
        setIsCreateOpen,
        editingDepartment,
        setEditingDepartment,
        deletingDepartment,
        setDeletingDepartment,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
