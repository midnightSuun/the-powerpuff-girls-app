"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { useCreateCv } from "../../hooks/use-сreate-сv"

interface CreateCvModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (data: {
        name: string
        education: string
        description: string
    }) => Promise<void> | void
    error?: string | null
    isSubmitting: boolean
}

export function CreateCvModal({
    isOpen,
    onClose,
    onCreate,
    error,
    isSubmitting,
}: CreateCvModalProps) {
    const t = useTranslations("CV.form")

    const {
        name,
        setName,
        education,
        setEducation,
        description,
        setDescription,
        isValid,
        handleSubmit,
    } = useCreateCv({ onCreate })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("createTitle")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={t("cancel")}
            confirmText={t("create")}
            pendingText={t("creating")}
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <Input
                    type="text"
                    maxLength={255}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("name")}
                    className="rounded-none border-input bg-background px-4 py-6 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                />

                <Input
                    type="text"
                    maxLength={255}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder={t("education")}
                    className="rounded-none border-input bg-background px-4 py-6 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                />

                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("description")}
                    className="rounded-none border-input bg-background p-4 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring min-h-32 resize-none"
                />
            </div>
        </BaseModal>
    )
}
