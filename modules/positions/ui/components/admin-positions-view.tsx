"use client"

import { useTranslations } from "next-intl"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"
import {
    type AdminPositionItem,
    useAdminPositionsView,
} from "@/modules/positions/hooks/use-admin-positions-view"

import { CreatePositionModal } from "./create-position-admin-modal"
import { DeletePositionModal } from "./delete-position-admin-modal"
import { EditPositionModal } from "./edit-position-admin-modal"

interface AdminPositionsViewProps {
    initialPositions: AdminPositionItem[]
}

export function AdminPositionsView({
    initialPositions,
}: AdminPositionsViewProps) {
    const t = useTranslations("Admin.positions")
    const tCommon = useTranslations("Admin.common")

    const {
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
    } = useAdminPositionsView({ initialPositions })

    const columns: Column<AdminPositionItem>[] = [
        { key: "name", label: t("columns.name"), sortable: true },
    ]

    return (
        <div className="w-full">
            <AdminDataTable
                data={positions}
                columns={columns}
                searchPlaceholder={tCommon("search")}
                createButtonLabel={t("createButton")}
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(pos) => setEditingPosition(pos)}
                onDeleteClick={(pos) => setDeletingPosition(pos)}
                getSearchableString={(pos) => pos.name}
                getSortValue={(pos) => pos.name}
                emptyMessage={t("empty")}
            />

            <CreatePositionModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                existingNames={positions.map((p) => p.name)}
                onCreate={handleCreate}
            />

            <EditPositionModal
                isOpen={Boolean(editingPosition)}
                onClose={() => setEditingPosition(null)}
                position={editingPosition}
                existingNames={positions.map((p) => p.name)}
                onUpdate={handleUpdate}
            />

            <DeletePositionModal
                isOpen={Boolean(deletingPosition)}
                onClose={() => setDeletingPosition(null)}
                positionName={deletingPosition?.name ?? ""}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
