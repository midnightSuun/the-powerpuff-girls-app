"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { type AdminDepartmentItem } from "@/modules/departments/hooks/use-admin-departments-view"
import { useEditDepartmentModal } from "@/modules/departments/hooks/use-edit-department-modal"

export interface EditDepartmentModalProps {
    isOpen: boolean
    department: AdminDepartmentItem | null
    existingNames?: string[]
    onClose: () => void
    onUpdate: (id: string, data: { name: string }) => Promise<void>
}

export function EditDepartmentModal(props: EditDepartmentModalProps) {
    const { isOpen, onClose, department, existingNames = [], onUpdate } = props
    const t = useTranslations("Admin.departments.edit")
    const tCommon = useTranslations("Admin.common")

    const { name, setName, inlineError, error, isSubmitting, handleSubmit } =
        useEditDepartmentModal({
            isOpen,
            department,
            existingNames,
            onClose,
            onUpdate,
        })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("title")}
            isPending={isSubmitting}
            cancelText={tCommon("cancel")}
            confirmText={tCommon("save")}
            pendingText={tCommon("saving")}
            onConfirm={handleSubmit}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        {t("departmentName")}
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("departmentPlaceholder")}
                    />
                    {inlineError && (
                        <p className="text-sm text-destructive">
                            {t(inlineError)}
                        </p>
                    )}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        </BaseModal>
    )
}
