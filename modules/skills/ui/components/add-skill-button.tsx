"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { AddItemButton } from "@/components/ui/list-management-buttons"

import { SkillOption, UserSkill } from "../../hooks/use-add-skill-modal"
import { AddSkillModal } from "./add-skill-modal"

interface AddSkillButtonProps {
    cvId: string
    existingSkills?: UserSkill[]
    availableSkills?: SkillOption[]
}

export function AddSkillButton({
    cvId,
    existingSkills = [],
    availableSkills = [],
}: AddSkillButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations("Skills.actions")

    return (
        <>
            <AddItemButton label={t("add")} onClick={() => setIsOpen(true)} />

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
