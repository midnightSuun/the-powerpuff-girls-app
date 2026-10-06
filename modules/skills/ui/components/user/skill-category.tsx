import { ProgressListItem } from "@/components/ui/progress-list-item"
import type { Mastery } from "@/gql/generated/graphql"

export interface Skill {
    name: string
    mastery: Mastery
    categoryId?: string | null
}

interface SkillCategoryProps {
    title: string
    skills: Skill[]
    isSelectionMode?: boolean
    selectedSkills?: string[]
    onSelectSkill?: (skillName: string) => void
    onEditSkill?: (skill: Skill) => void
}

export function SkillCategory({
    title,
    skills,
    isSelectionMode = false,
    selectedSkills = [],
    onSelectSkill,
    onEditSkill,
}: SkillCategoryProps) {
    if (skills.length === 0) return null

    return (
        <div className="mb-6">
            <p className="font-roboto text-[16px] font-normal leading-6 tracking-[0.15px] text-foreground mb-4">
                {title}
            </p>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                {skills.map((skill) => (
                    <ProgressListItem
                        key={skill.name}
                        name={skill.name}
                        mastery={skill.mastery}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedSkills.includes(skill.name)}
                        onSelect={() => onSelectSkill?.(skill.name)}
                        onEdit={
                            onEditSkill ? () => onEditSkill(skill) : undefined
                        }
                    />
                ))}
            </div>
        </div>
    )
}
