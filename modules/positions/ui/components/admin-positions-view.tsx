"use client"

import { useTranslations } from "next-intl"

import type { Column } from "@/components/ui/admin-data-table"
import { AdminNameCrudPage } from "@/components/ui/admin-name-crud-page"
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
        <AdminNameCrudPage
            data={positions}
            columns={columns}
            createButtonLabel={t("createButton")}
            emptyMessage={t("empty")}
            getItemName={(position) => position.name}
            onCreateClick={() => setIsCreateOpen(true)}
            onEditClick={(position) => setEditingPosition(position)}
            onDeleteClick={(position) => setDeletingPosition(position)}
        >
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
        </AdminNameCrudPage>
    )
}
