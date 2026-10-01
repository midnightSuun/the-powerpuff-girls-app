"use client"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEditSkillAdminModal } from "@/modules/skills/hooks/use-edit-skill-admin-modal"

import type { CategoryOption } from "./create-skill-modal"

export interface AdminSkillItem {
    id: string
    name: string
    category: string
    categoryId: string
}

interface EditSkillModalProps {
    isOpen: boolean
    onClose: () => void
    skill: AdminSkillItem | null
    categories: CategoryOption[]
    onUpdate: (
        id: string,
        data: { name: string; categoryId: string },
    ) => Promise<void>
}

export function EditSkillModal(props: EditSkillModalProps) {
    const { isOpen, onClose, categories } = props
    const {
        name,
        setName,
        categoryId,
        setCategoryId,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useEditSkillAdminModal(props)

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit skill"
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText="CANCEL"
            confirmText="SAVE"
            pendingText="SAVING..."
            confirmButtonVariant="destructive"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        Skill Name
                    </span>
                    <Input
                        placeholder="Skill"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className="border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] rounded-none focus-visible:ring-0"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        Category
                    </span>
                    <Select
                        value={categoryId}
                        onValueChange={(val) => setCategoryId(val ?? "")}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none">
                            <SelectValue placeholder="Category" />
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
