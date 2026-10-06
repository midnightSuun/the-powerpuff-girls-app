"use client"

import { useTranslations } from "next-intl"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCreateSkillAdminModal } from "@/modules/skills/hooks/use-create-skill-admin-modal"

export interface CategoryOption {
    id: string
    name: string
}

interface CreateSkillModalProps {
    isOpen: boolean
    onClose: () => void
    categories: CategoryOption[]
    existingSkillNames?: string[]
    onCreate: (data: { name: string; categoryId: string }) => Promise<void>
}

export function CreateSkillModal(props: CreateSkillModalProps) {
    const { isOpen, onClose, categories } = props
    const t = useTranslations("Skills.admin")

    const {
        name,
        setName,
        categoryId,
        setCategoryId,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useCreateSkillAdminModal(props)

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
            confirmButtonVariant="destructive"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {t("skill")}
                    </span>
                    <Input
                        placeholder={t("skill")}
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
                        {t("category")}
                    </span>
                    <Select
                        value={categoryId}
                        onValueChange={(val) => setCategoryId(val ?? "")}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none">
                            <SelectValue placeholder={t("category")} />
                        </SelectTrigger>
                        <SelectContent
                            side="bottom"
                            align="start"
                            className="max-h-60 overflow-y-auto border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545] text-gray-900 dark:text-foreground p-1 shadow-lg rounded-none"
                        >
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </BaseModal>
    )
}
