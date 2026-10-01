"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    type SkillOption,
    useAddSkillModal,
    type UserSkill,
} from "../../hooks/use-add-skill-modal"
import { SkillMasterySelect } from "./skill-mastery-select"

interface AddSkillModalProps {
    isOpen: boolean
    onClose: () => void
    cvId: string
    existingSkills?: UserSkill[]
    availableSkills?: SkillOption[]
}

export function AddSkillModal(props: AddSkillModalProps) {
    const {
        isOpen,
        t,
        selectedSkillId,
        setSelectedSkillId,
        mastery,
        setMastery,
        error,
        isSubmitting,
        unselectedSkills,
        availableSkills,
        isValid,
        handleClose,
        handleSubmit,
    } = useAddSkillModal(props)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-155 rounded-xl border border-border bg-background dark:bg-auth-bg dark:border-auth-card-border p-8 text-foreground shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-xl font-medium text-foreground">
                        {t("title")}
                    </p>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="rounded-md bg-red-100 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <Select
                        value={selectedSkillId}
                        onValueChange={setSelectedSkillId}
                    >
                        <SelectTrigger className="w-full border border-[#D1D1D1] dark:border-auth-card-border bg-[#ECECEC] dark:bg-[#454545] px-4 py-6 text-sm text-gray-800 dark:text-foreground shadow-none focus:ring-0 rounded-none">
                            <SelectValue placeholder={t("skillPlaceholder")}>
                                {selectedSkillId
                                    ? availableSkills.find(
                                          (s) =>
                                              String(s.id) === selectedSkillId,
                                      )?.name
                                    : undefined}
                            </SelectValue>
                        </SelectTrigger>

                        <SelectContent
                            side="bottom"
                            align="start"
                            sideOffset={6}
                            alignItemWithTrigger={false}
                            className="max-h-60 overflow-y-auto border border-[#D1D1D1] dark:border-auth-card-border bg-[#F5F5F7] dark:bg-[#454545] text-gray-900 dark:text-foreground p-1 shadow-lg rounded-none"
                        >
                            {unselectedSkills.length > 0 ? (
                                unselectedSkills.map((skill) => (
                                    <SelectItem
                                        key={skill.id}
                                        value={String(skill.id)}
                                    >
                                        {skill.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    {t("allSkillsAdded")}
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    <SkillMasterySelect
                        value={mastery}
                        onValueChange={setMastery}
                    />

                    <div className="mt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? t("adding") : t("submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
