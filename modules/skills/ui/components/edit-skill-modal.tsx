"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Mastery } from "@/gql/generated/graphql"

import { useEditSkillModal } from "../../hooks/use-edit-skill-modal"
import { SkillMasterySelect } from "./skill-mastery-select"

interface EditSkillModalProps {
    isOpen: boolean
    onClose: () => void
    skillName: string
    currentMastery: Mastery | string | number
    onUpdate: (mastery: Mastery) => Promise<void>
}

export function EditSkillModal(props: EditSkillModalProps) {
    const { isOpen, skillName } = props
    const {
        t,
        mastery,
        setMastery,
        error,
        isSubmitting,
        isValid,
        handleClose,
        handleSubmit,
    } = useEditSkillModal(props)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-155 bg-[#F5F5F7] p-8 shadow-2xl dark:bg-neutral-900">
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
                        {t("title")}
                    </p>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="rounded-none bg-red-100 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t("skill")}
                        </span>
                        <Select disabled value={skillName}>
                            <SelectTrigger className="w-full border border-[#D1D1D1] bg-[#C8C8CC] px-4 py-6 text-sm text-gray-600 opacity-80 shadow-none rounded-none cursor-not-allowed">
                                <SelectValue>{skillName}</SelectValue>
                            </SelectTrigger>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t("mastery")}
                        </span>
                        <SkillMasterySelect
                            value={mastery}
                            onValueChange={(value) => setMastery(value)}
                        />
                    </div>

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
                            {isSubmitting ? t("updating") : t("submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
