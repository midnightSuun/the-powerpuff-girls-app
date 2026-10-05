"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { useCreateLanguageModal } from "@/modules/languages/hooks/use-create-language-modal"

interface CreateLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    existingLanguageNames?: string[]
    onCreate: (data: { name: string; iso2: string }) => Promise<void>
}

export function CreateLanguageModal(props: CreateLanguageModalProps) {
    const { isOpen, onClose } = props
    const t = useTranslations("Languages.admin.create")

    const {
        name,
        setName,
        iso2,
        setIso2,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useCreateLanguageModal(props)

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("title")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={t("cancel")}
            confirmText={t("create")}
            pendingText={t("creating")}
            confirmButtonVariant="destructive"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {t("languageName")}
                    </span>
                    <Input
                        placeholder={t("languagePlaceholder")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className="border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] rounded-none focus-visible:ring-0"
                    />
                    {inlineError && (
                        <span className="mt-1 text-xs text-red-500">
                            {t("alreadyExists")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {t("isoCode")}
                    </span>
                    <Input
                        placeholder={t("isoCodePlaceholder")}
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
