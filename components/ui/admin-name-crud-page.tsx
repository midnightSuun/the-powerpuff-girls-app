"use client"

import { memo, type ReactNode } from "react"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"

interface AdminNameCrudPageProps<T extends { id: string | number }> {
    data: T[]
    columns: Column<T>[]
    createButtonLabel: string
    emptyMessage: string
    getItemName: (item: T) => string
    onCreateClick: () => void
    onEditClick: (item: T) => void
    onDeleteClick: (item: T) => void
    children?: ReactNode
}

function AdminNameCrudPageInner<T extends { id: string | number }>({
    data,
    columns,
    createButtonLabel,
    emptyMessage,
    getItemName,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    children,
}: AdminNameCrudPageProps<T>) {
    return (
        <div className="w-full">
            <AdminDataTable
                data={data}
                columns={columns}
                showSearchInput={false}
                createButtonLabel={createButtonLabel}
                onCreateClick={onCreateClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                getSearchableString={getItemName}
                getSortValue={getItemName}
                emptyMessage={emptyMessage}
            />
            {children}
        </div>
    )
}

export const AdminNameCrudPage = memo(AdminNameCrudPageInner, (prev, next) => {
    if (prev.createButtonLabel !== next.createButtonLabel) return false
    if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) return false
    return true
}) as typeof AdminNameCrudPageInner
