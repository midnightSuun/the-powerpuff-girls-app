"use client"

import { useState } from "react"

import { Mastery } from "@/gql/generated/graphql"

import { updateCvSkill } from "../../api/skills"
import { AddSkillButton } from "./add-skill-button"
import { SkillOption } from "./add-skill-modal"
import { DeleteSkillsButton } from "./delete-skill-button"
import { EditSkillModal } from "./edit-skill-modal"
import { SkillCategory } from "./skill-catergory"

interface Skill {
    name: string
    mastery: string | number
    categoryId?: string | null
}

interface Category {
    id: string
    title: string
    skills: Skill[]
}

interface SkillsViewProps {
    cvId: string
    categories: Category[]
    typedSkills: Skill[]
    availableSkills: SkillOption[]
    isDarkMode?: boolean
}

export function SkillsView({
    cvId,
    categories,
    typedSkills,
    availableSkills,
    isDarkMode,
}: SkillsViewProps) {
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

    return (
        <div className="flex items-start gap-16">
            <div className="flex-1 max-w-[852px] pl-50 pt-6">
                <div className="space-y-8">
                    {categories.map((category) => (
                        <SkillCategory
                            key={category.id}
                            title={category.title}
                            skills={category.skills}
                            isSelectionMode={isSelectionMode}
                            selectedSkills={selectedSkills}
                            onSelectSkill={handleToggleSkill}
                            onEditSkill={(skill) => setEditingSkill(skill)}
                        />
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-end gap-6 text-xs font-medium tracking-wider text-gray-700">
                    {!isSelectionMode && (
                        <AddSkillButton
                            cvId={cvId}
                            isDarkMode={isDarkMode}
                            existingSkills={typedSkills}
                            availableSkills={availableSkills}
                        />
                    )}

                    <DeleteSkillsButton
                        cvId={cvId}
                        selectedSkills={selectedSkills}
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={setIsSelectionMode}
                        onClearSelection={() => setSelectedSkills([])}
                    />
                </div>
            </div>

            <EditSkillModal
                isOpen={Boolean(editingSkill)}
                onClose={() => setEditingSkill(null)}
                skillName={editingSkill?.name ?? ""}
                currentMastery={String(editingSkill?.mastery ?? "")}
                onUpdate={handleUpdateSkill}
            />
        </div>
    )
}
