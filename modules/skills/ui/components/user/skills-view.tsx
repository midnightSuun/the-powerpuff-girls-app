"use client"

import { useTranslations } from "next-intl"

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
    const t = useTranslations("Skills")
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
        <div
            className={
                compact
                    ? "mx-auto w-full max-w-275"
                    : "w-full max-w-6xl px-6 py-6 lg:pl-50"
            }
        >
            <div className="w-full">
                {categories.length === 0 ? (
                    <div className="py-12 text-center text-sm font-normal text-muted-foreground">
                        {t("empty")}
                    </div>
                ) : (
                    <div className="space-y-6">
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
                )}

                {canManageSkills && (
                    <div
                        className={`mt-10 flex items-center justify-end gap-8 text-xs font-medium tracking-wider text-muted-foreground ${
                            compact ? "justify-center" : ""
                        }`}
                    >
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
