"use client"

import { X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Mastery } from "@/gql/generated/graphql"

interface EditSkillModalProps {
    isOpen: boolean
    onClose: () => void
    skillName: string
    currentMastery: Mastery | string | number
    onUpdate: (mastery: Mastery) => Promise<void>
}

export function EditSkillModal({
    isOpen,
    onClose,
    skillName,
    currentMastery,
    onUpdate,
}: EditSkillModalProps) {
    const [mastery, setMastery] = useState<Mastery | "">(
        (currentMastery as Mastery) || "",
    )
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevSkill, setPrevSkill] = useState({
        skillName,
        currentMastery,
        isOpen,
    })

    if (
        isOpen &&
        (skillName !== prevSkill.skillName ||
            currentMastery !== prevSkill.currentMastery ||
            !prevSkill.isOpen)
    ) {
        setPrevSkill({ skillName, currentMastery, isOpen })
        setMastery((currentMastery as Mastery) || "")
        setError(null)
    }

    if (!isOpen) return null

    const handleClose = () => {
        setError(null)
        onClose()
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!mastery) {
            setError("Skill mastery is required")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await onUpdate(mastery as Mastery)
            handleClose()
        } catch (err: unknown) {
            const errorObj = err as Error
            console.error("Failed to update skill:", errorObj)
            setError(
                errorObj.message || "Failed to update skill. Please try again.",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const isValid = Boolean(mastery)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-155 bg-[#F5F5F7] p-8 shadow-2xl dark:bg-neutral-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                        Update skill
                    </h2>
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
                            Skill
                        </span>
                        <Select disabled value={skillName}>
                            <SelectTrigger className="w-full border border-[#D1D1D1] bg-[#C8C8CC] px-4 py-6 text-sm text-gray-600 opacity-80 shadow-none rounded-none cursor-not-allowed">
                                <SelectValue>{skillName}</SelectValue>
                            </SelectTrigger>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Skill mastery
                        </span>
                        <Select
                            value={mastery}
                            onValueChange={(value) => {
                                setMastery(value as Mastery)
                                setError(null)
                            }}
                        >
                            <SelectTrigger className="w-full border border-[#D1D1D1] bg-[#ECECEC] px-4 py-6 text-sm text-gray-800 shadow-none focus:ring-0 rounded-none ">
                                <SelectValue placeholder="Skill mastery" />
                            </SelectTrigger>

                            <SelectContent
                                side="bottom"
                                align="start"
                                sideOffset={6}
                                alignItemWithTrigger={false}
                                className="max-h-60 overflow-y-auto border border-[#D1D1D1] bg-[#F5F5F7] p-1 shadow-lg rounded-none"
                            >
                                <SelectItem value="Novice">Novice</SelectItem>
                                <SelectItem value="Advanced">
                                    Advanced
                                </SelectItem>
                                <SelectItem value="Competent">
                                    Competent
                                </SelectItem>
                                <SelectItem value="Proficient">
                                    Proficient
                                </SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            CANCEL
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? "UPDATING..." : "UPDATE"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
