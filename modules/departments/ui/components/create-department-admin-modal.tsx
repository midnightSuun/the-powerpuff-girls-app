"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { useCreateDepartmentModal } from "@/modules/departments/hooks/use-create-department-modal"

export interface CreateDepartmentModalProps {
    isOpen: boolean
    existingNames?: string[]
    onClose: () => void
    onCreate: (data: { name: string }) => Promise<void>
}

export function CreateDepartmentModal(props: CreateDepartmentModalProps) {
    const { isOpen, onClose, existingNames = [], onCreate } = props
    const t = useTranslations("Admin.departments.create")
    const tCommon = useTranslations("Admin.common")

    const { name, setName, inlineError, error, isSubmitting, handleSubmit } =
        useCreateDepartmentModal({
            isOpen,
            existingNames,
            onClose,
            onSubmit: onCreate,
        })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("title")}
            isPending={isSubmitting}
            cancelText={tCommon("cancel")}
            confirmText={tCommon("create")}
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
