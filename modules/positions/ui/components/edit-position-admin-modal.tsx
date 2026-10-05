"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { type AdminPositionItem } from "@/modules/positions/hooks/use-admin-positions-view"
import { useEditPositionModal } from "@/modules/positions/hooks/use-edit-position-modal"

export interface EditPositionModalProps {
    isOpen: boolean
    position: AdminPositionItem | null
    existingNames?: string[]
    onClose: () => void
    onUpdate: (id: string, data: { name: string }) => Promise<void>
}

export function EditPositionModal(props: EditPositionModalProps) {
    const { isOpen, onClose, position, existingNames = [], onUpdate } = props
    const t = useTranslations("Admin.positions.edit")
    const tCommon = useTranslations("Admin.common")

    const { name, setName, inlineError, error, isSubmitting, handleSubmit } =
        useEditPositionModal({
            isOpen,
            position,
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
                        {t("positionName")}
                    </label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("positionPlaceholder")}
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
