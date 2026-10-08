import type { ReactNode } from "react"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"

interface AdminNameCrudPageProps<T extends { id: string | number }> {
    data: T[]
    columns: Column<T>[]
    searchPlaceholder: string
    createButtonLabel: string
    emptyMessage: string
    getItemName: (item: T) => string
    onCreateClick: () => void
    onEditClick: (item: T) => void
    onDeleteClick: (item: T) => void
    children: ReactNode
}

export function AdminNameCrudPage<T extends { id: string | number }>({
    data,
    columns,
    searchPlaceholder,
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
                searchPlaceholder={searchPlaceholder}
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
