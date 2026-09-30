"use client"

import { useState } from "react"

import { AddSkillButton } from "./add-skill-button"
import { SkillOption } from "./add-skill-modal"
import { DeleteSkillsButton } from "./delete-skill-button"
import { SkillCategory } from "./skill-catergory"

interface Skill {
    name: string
    mastery: string
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

    const handleToggleSkill = (skillName: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skillName)
                ? prev.filter((name) => name !== skillName)
                : [...prev, skillName],
        )
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
        </div>
    )
}
