"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import { useDeleteDepartmentModal } from "@/modules/departments/hooks/use-delete-department-modal"

interface DeleteDepartmentModalProps {
    isOpen: boolean
    onClose: () => void
    departmentName: string
    onConfirm: () => Promise<void>
}

export function DeleteDepartmentModal(props: DeleteDepartmentModalProps) {
    const { isOpen, onClose, departmentName } = props
    const t = useTranslations("Admin.departments.delete")
    const tCommon = useTranslations("Admin.common")

    const { isDeleting, error, handleConfirm } = useDeleteDepartmentModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={t("title")}
            description={t("confirmation", { name: departmentName })}
            cancelText={tCommon("cancel")}
            confirmText={tCommon("confirm")}
            deletingText={tCommon("deleting")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
