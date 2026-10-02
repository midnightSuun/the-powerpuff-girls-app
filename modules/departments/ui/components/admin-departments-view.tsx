"use client"

import { useTranslations } from "next-intl"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"
import {
    type AdminDepartmentItem,
    useAdminDepartmentsView,
} from "@/modules/departments/hooks/use-admin-departments-view"

import { CreateDepartmentModal } from "./create-department-admin-modal"
import { DeleteDepartmentModal } from "./delete-department-admin-modal"
import { EditDepartmentModal } from "./edit-department-admin-modal"

interface AdminDepartmentsViewProps {
    initialDepartments: AdminDepartmentItem[]
}

export function AdminDepartmentsView({
    initialDepartments,
}: AdminDepartmentsViewProps) {
    const t = useTranslations("Admin.departments")
    const tCommon = useTranslations("Admin.common")

    const {
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
    } = useAdminDepartmentsView({ initialDepartments })

    const columns: Column<AdminDepartmentItem>[] = [
        { key: "name", label: t("columns.name"), sortable: true },
    ]

    return (
        <div className="w-full">
            <AdminDataTable
                data={departments}
                columns={columns}
                searchPlaceholder={tCommon("search")}
                createButtonLabel={t("createButton")}
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(dept) => setEditingDepartment(dept)}
                onDeleteClick={(dept) => setDeletingDepartment(dept)}
                getSearchableString={(dept) => dept.name}
                getSortValue={(dept) => dept.name}
                emptyMessage={t("empty")}
            />

            <CreateDepartmentModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                existingNames={departments.map((d) => d.name)}
                onCreate={handleCreate}
            />

            <EditDepartmentModal
                isOpen={Boolean(editingDepartment)}
                onClose={() => setEditingDepartment(null)}
                department={editingDepartment}
                existingNames={departments.map((d) => d.name)}
                onUpdate={handleUpdate}
            />

            <DeleteDepartmentModal
                isOpen={Boolean(deletingDepartment)}
                onClose={() => setDeletingDepartment(null)}
                departmentName={deletingDepartment?.name ?? ""}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
