"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import {
    type AdminLanguageItem,
    useEditLanguageAdminModal,
} from "@/modules/languages/hooks/use-edit-language-admin-modal"

export type { AdminLanguageItem }

interface EditLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    language: AdminLanguageItem | null
    onUpdate: (
        id: string,
        data: { name: string; iso2: string },
    ) => Promise<void>
}

export function EditLanguageModal(props: EditLanguageModalProps) {
    const { isOpen, onClose } = props
    const t = useTranslations("Admin.languages.edit")
    const tCommon = useTranslations("Admin.common")

    const {
        name,
        setName,
        iso2,
        setIso2,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useEditLanguageAdminModal(props)

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("title")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={tCommon("cancel")}
            confirmText={tCommon("save")}
            pendingText={tCommon("saving")}
            confirmButtonVariant="destructive"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {t("languageName")}
                    </span>
                    <Input
                        placeholder={t("languageName")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className="border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] rounded-none focus-visible:ring-0"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {t("iso2")}
                    </span>
                    <Input
                        placeholder={t("iso2")}
                        value={iso2}
                        onChange={(e) => setIso2(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={2}
                        className="border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] rounded-none focus-visible:ring-0"
                    />
                </div>
            </div>
        </BaseModal>
    )
}
