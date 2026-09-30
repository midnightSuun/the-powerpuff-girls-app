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

import { addCvSkills } from "../../api/skills"

export interface SkillOption {
    id: string
    name: string
    categoryId: string
}

export interface UserSkill {
    name: string
}

interface AddSkillModalProps {
    isOpen: boolean
    onClose: () => void
    cvId: string
    existingSkills?: UserSkill[]
    availableSkills?: SkillOption[]
}

export function AddSkillModal({
    isOpen,
    onClose,
    cvId,
    existingSkills = [],
    availableSkills = [],
}: AddSkillModalProps) {
    const [selectedSkillId, setSelectedSkillId] = useState("")
    const [mastery, setMastery] = useState<Mastery | "">("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleClose = () => {
        setSelectedSkillId("")
        setMastery("")
        setError(null)
        onClose()
    }

    const unselectedSkills = availableSkills.filter(
        (available) =>
            !existingSkills.some(
                (existing) => existing.name === available.name,
            ),
    )

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!selectedSkillId) {
            setError("Please select a skill")
            return
        }

        if (!mastery) {
            setError("Please select skill mastery")
            return
        }

        const selectedSkill = availableSkills.find(
            (s) => String(s.id) === String(selectedSkillId),
        )

        if (!selectedSkill) {
            setError("Selected skill not found")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await addCvSkills({
                cvId: cvId,
                name: selectedSkill.name,
                categoryId: selectedSkill.categoryId || null,
                mastery: mastery as Mastery,
            })

            handleClose()
        } catch (err: unknown) {
            const error = err as Error
            console.error("Failed to add skill:", error)

            const errorMessage = error.message || String(err)
            if (errorMessage.includes("skillHasBeenAdded")) {
                setError("This skill has already been added to your CV.")
            } else {
                setError("Failed to add skill. Please try again.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const isValid = Boolean(selectedSkillId && mastery)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-155 bg-[#F5F5F7] p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900">
                        Add skill
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="rounded-md bg-red-100 p-3 text-sm text-red-600 ">
                            {error}
                        </div>
                    )}

                    <Select
                        value={selectedSkillId}
                        onValueChange={(value) => {
                            setSelectedSkillId(value ?? "")
                            setError(null)
                        }}
                    >
                        <SelectTrigger className="w-full border border-[#D1D1D1] bg-[#ECECEC] px-4 py-6 text-sm text-gray-800 shadow-none focus:ring-0 rounded-none">
                            <SelectValue placeholder="Skill">
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
                            className="max-h-60 overflow-y-auto border border-[#D1D1D1] bg-[#F5F5F7] p-1 shadow-lg rounded-none"
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
                                <div className="p-3 text-center text-xs text-gray-500">
                                    All available skills added
                                </div>
                            )}
                        </SelectContent>
                    </Select>

                    <Select
                        value={mastery}
                        onValueChange={(value) => {
                            setMastery(value as Mastery)
                            setError(null)
                        }}
                    >
                        <SelectTrigger className="w-full border border-[#D1D1D1] bg-[#ECECEC] px-4 py-6 text-sm text-gray-800 shadow-none focus:ring-0 rounded-none">
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
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Competent">Competent</SelectItem>
                            <SelectItem value="Proficient">
                                Proficient
                            </SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>

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
                            {isSubmitting ? "ADDING..." : "ADD"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
