"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { useCreateLanguageAdminModal } from "@/modules/languages/hooks/use-create-language-admin-modal"

interface CreateLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    existingLanguageNames?: string[]
    onCreate: (data: {
        name: string
        iso2: string
        nativeName: string
    }) => Promise<void>
}

export function CreateLanguageModal(props: CreateLanguageModalProps) {
    const { isOpen, onClose } = props
    const t = useTranslations("Languages.admin.create")

    const {
        name,
        setName,
        iso2,
        setIso2,
        nativeName,
        setNativeName,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useCreateLanguageAdminModal(props)

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
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="relative flex flex-col pt-4">
                    {Boolean(name) && (
                        <span className="absolute left-0 top-0 text-[10px] text-muted-foreground">
                            {t("languageName")}
                        </span>
                    )}
                    <Input
                        placeholder={
                            Boolean(name) ? undefined : t("languageName")
                        }
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={50}
                        className="rounded-none border border-[#D1D1D1] bg-[#ECECEC] focus-visible:ring-0 dark:border-auth-card-border dark:bg-[#454545]"
                    />
                    {inlineError && (
                        <span className="mt-1 text-xs text-red-500">
                            {inlineError}
                        </span>
                    )}
                </div>

                <div className="relative flex flex-col pt-4">
                    {Boolean(iso2) && (
                        <span className="absolute left-0 top-0 text-[10px] text-muted-foreground">
                            {t("isoCode")}
                        </span>
                    )}
                    <Input
                        placeholder={Boolean(iso2) ? undefined : t("isoCode")}
                        value={iso2}
                        onChange={(e) =>
                            setIso2(e.target.value.toUpperCase().slice(0, 2))
                        }
                        disabled={isSubmitting}
                        maxLength={2}
                        className="rounded-none border border-[#D1D1D1] bg-[#ECECEC] uppercase focus-visible:ring-0 dark:border-auth-card-border dark:bg-[#454545]"
                    />
                </div>

                <div className="relative flex flex-col pt-4">
                    {Boolean(nativeName) && (
                        <span className="absolute left-0 top-0 text-[10px] text-muted-foreground">
                            {t("nativeName")}
                        </span>
                    )}
                    <Input
                        placeholder={
                            Boolean(nativeName) ? undefined : t("nativeName")
                        }
                        value={nativeName}
                        onChange={(e) => setNativeName(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={50}
                        className="rounded-none border border-[#D1D1D1] bg-[#ECECEC] focus-visible:ring-0 dark:border-auth-card-border dark:bg-[#454545]"
                    />
                </div>
            </div>
        </BaseModal>
    )
}
