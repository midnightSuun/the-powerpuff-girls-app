"use client"

import { SkillOption } from "../../../hooks/use-add-skill-modal"
import { useSkillsView } from "../../../hooks/use-skills-view"
import { AddSkillButton } from "./add-skill-button"
import { DeleteSkillsButton } from "./delete-skill-button"
import { EditSkillModal } from "./edit-skill-modal"
import { type Skill, SkillCategory } from "./skill-category"

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
    canManageSkills: boolean
    compact?: boolean
}

export function SkillsView({
    cvId,
    categories,
    typedSkills,
    availableSkills,
    canManageSkills,
    compact = false,
}: SkillsViewProps) {
    const {
        isSelectionMode,
        setIsSelectionMode,
        selectedSkills,
        clearSelection,
        editingSkill,
        setEditingSkill,
        handleToggleSkill,
        handleUpdateSkill,
    } = useSkillsView({ cvId })

    return (
        <div className="flex items-start gap-16">
            <div
                className={`flex-1 pt-6 ${
                    compact ? "w-full max-w-none pl-0" : "max-w-213 pl-50"
                }`}
            >
                <div className="space-y-8">
                    {categories.map((category) => (
                        <SkillCategory
                            key={category.id}
                            title={category.title}
                            skills={category.skills}
                            isSelectionMode={isSelectionMode}
                            selectedSkills={selectedSkills}
                            onSelectSkill={handleToggleSkill}
                            onEditSkill={
                                canManageSkills
                                    ? (skill) => setEditingSkill(skill)
                                    : undefined
                            }
                        />
                    ))}
                </div>

                {canManageSkills && (
                    <div className="mt-8 flex flex-wrap items-center justify-end gap-6 text-xs font-medium tracking-wider text-muted-foreground">
                        {!isSelectionMode && (
                            <AddSkillButton
                                cvId={cvId}
                                existingSkills={typedSkills}
                                availableSkills={availableSkills}
                            />
                        )}

                        <DeleteSkillsButton
                            cvId={cvId}
                            selectedSkills={selectedSkills}
                            isSelectionMode={isSelectionMode}
                            onToggleSelectionMode={setIsSelectionMode}
                            onClearSelection={clearSelection}
                            disabled={typedSkills.length === 0}
                        />
                    </div>
                )}
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
