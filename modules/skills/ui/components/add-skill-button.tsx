"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

import { AddSkillModal, SkillOption, UserSkill } from "./add-skill-modal"

interface AddSkillButtonProps {
    cvId: string
    isDarkMode?: boolean
    existingSkills?: UserSkill[]
    availableSkills?: SkillOption[]
}

export function AddSkillButton({
    cvId,
    isDarkMode,
    existingSkills = [],
    availableSkills = [],
}: AddSkillButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                variant="ghost"
                className="gap-2"
                onClick={() => setIsOpen(true)}
            >
                <Plus className="h-5 w-5" />
                ADD SKILL
            </Button>

            <AddSkillModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                cvId={cvId}
                existingSkills={existingSkills}
                availableSkills={availableSkills}
            />
        </>
    )
}
