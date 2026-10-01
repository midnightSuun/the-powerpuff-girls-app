"use client"

import { useState } from "react"

import type { Mastery } from "@/gql/generated/graphql"
import { updateCvSkill } from "@/modules/skills/api/skills"

import { Skill } from "../ui/components/skill-category"

interface UseSkillsViewProps {
    cvId: string
}

export function useSkillsView({ cvId }: UseSkillsViewProps) {
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

    const handleToggleSkill = (skillName: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skillName)
                ? prev.filter((name) => name !== skillName)
                : [...prev, skillName],
        )
    }

    const handleUpdateSkill = async (newMastery: Mastery) => {
        if (!editingSkill) return

        await updateCvSkill({
            cvId,
            name: editingSkill.name,
            mastery: newMastery,
        })

        setEditingSkill(null)
    }

    return {
        isSelectionMode,
        setIsSelectionMode,
        selectedSkills,
        clearSelection: () => setSelectedSkills([]),
        editingSkill,
        setEditingSkill,
        handleToggleSkill,
        handleUpdateSkill,
    }
}
