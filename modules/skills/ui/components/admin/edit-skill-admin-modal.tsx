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
import {
    type AdminSkillItem,
    useEditSkillAdminModal,
} from "@/modules/skills/hooks/use-edit-skill-admin-modal"

import type { CategoryOption } from "./create-skill-modal"

export type { AdminSkillItem }

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

const clsx = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(" ")

export function EditSkillModal(props: EditSkillModalProps) {
    const { isOpen, onClose, categories } = props
    const tAdmin = useTranslations("Skills.admin")
    const tSkills = useTranslations("Skills")

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

    const seenNames = new Set<string>()
    const uniqueCategories = categories.filter((cat) => {
        const translatedName = tSkills(`categories.${cat.id}`, {
            defaultValue: cat.name,
        })
        if (seenNames.has(translatedName)) {
            return false
        }
        seenNames.add(translatedName)
        return true
    })

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={tAdmin("editTitle")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={tAdmin("cancel")}
            confirmText={tAdmin("save")}
            pendingText={tAdmin("saving")}
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <Input
                        label={tAdmin("skill")}
                        placeholder={tAdmin("skill")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className="border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] rounded-none focus-visible:ring-0"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                        {tAdmin("category")}
                    </span>
                    <Select
                        value={String(categoryId)}
                        onValueChange={(val) => setCategoryId(val ?? "")}
                        disabled={isSubmitting}
                    >
                        <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none outline-none transition-colors">
                            <SelectValue placeholder={tAdmin("category")}>
                                {categoryId
                                    ? tSkills(`categories.${categoryId}`, {
                                          defaultValue:
                                              categories.find(
                                                  (cat) =>
                                                      String(cat.id) ===
                                                      String(categoryId),
                                              )?.name ?? String(categoryId),
                                      })
                                    : undefined}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignItemWithTrigger={false}
                            className={clsx(
                                "w-[var(--anchor-width)] max-h-60 overflow-y-auto p-0 shadow-xl rounded-none",
                                "border border-[#D1D1D1] bg-[#F5F5F7]",
                                "dark:border-auth-card-border dark:bg-[#454545]",
                            )}
                        >
                            {uniqueCategories.map((cat) => {
                                const isSelected =
                                    String(categoryId) === String(cat.id)
                                return (
                                    <SelectItem
                                        key={cat.id}
                                        value={String(cat.id)}
                                        className={clsx(
                                            "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                            "[&_svg]:hidden pr-4",
                                            isSelected
                                                ? "bg-[#626262] !text-[#F5F5F7] [&_*]:!text-[#F5F5F7] focus:bg-[#626262] dark:bg-[#F5F5F7] dark:!text-[#2E2E2E] dark:[&_*]:!text-[#2E2E2E]"
                                                : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-[#626262] dark:hover:bg-[#626262]",
                                        )}
                                    >
                                        <span className="font-sans font-normal">
                                            {tSkills(`categories.${cat.id}`, {
                                                defaultValue: cat.name,
                                            })}
                                        </span>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </BaseModal>
    )
}
