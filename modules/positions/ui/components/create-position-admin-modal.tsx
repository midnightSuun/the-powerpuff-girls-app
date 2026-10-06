"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { useCreatePositionModal } from "@/modules/positions/hooks/use-create-position-modal"

export interface CreatePositionModalProps {
    isOpen: boolean
    existingNames?: string[]
    onClose: () => void
    onCreate: (data: { name: string }) => Promise<void>
}

export function CreatePositionModal(props: CreatePositionModalProps) {
    const { isOpen, onClose, existingNames = [], onCreate } = props
    const t = useTranslations("Admin.positions.create")
    const tCommon = useTranslations("Admin.common")

    const { name, setName, inlineError, error, isSubmitting, handleSubmit } =
        useCreatePositionModal({
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
