"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { useUpdateCvModal } from "../../hooks/use-update-cv-modal"

interface CvItem {
    id: string
    name: string
    education: string
    description: string
}

interface UpdateCvModalProps {
    isOpen: boolean
    onClose: () => void
    cv: CvItem | null
    onUpdate: (data: {
        name: string
        education: string
        description: string
    }) => Promise<void> | void
    error?: string | null
    isSubmitting: boolean
}

export function UpdateCvModal({
    isOpen,
    onClose,
    cv,
    onUpdate,
    error,
    isSubmitting,
}: UpdateCvModalProps) {
    const t = useTranslations("CV.form")

    const {
        name,
        setName,
        education,
        setEducation,
        description,
        setDescription,
        hasSubmitted,
        isValid,
        handleSubmit,
    } = useUpdateCvModal({ cv, onUpdate })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("updateTitle")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={t("cancel")}
            confirmText={t("save")}
            pendingText={t("saving")}
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                        {t("name")} *
                    </label>
                    <Input
                        type="text"
                        maxLength={255}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-none"
                    />
                    {hasSubmitted && !name.trim() && (
                        <span className="text-xs text-red-500">
                            {t("nameRequired")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                        {t("education")} *
                    </label>
                    <Input
                        type="text"
                        maxLength={255}
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="rounded-none"
                    />
                    {hasSubmitted && !education.trim() && (
                        <span className="text-xs text-red-500">
                            {t("educationRequired")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                        {t("description")} *
                    </label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-none min-h-20"
                    />
                    {hasSubmitted && !description.trim() && (
                        <span className="text-xs text-red-500">
                            {t("descriptionRequired")}
                        </span>
                    )}
                </div>
            </div>
        </BaseModal>
    )
}
