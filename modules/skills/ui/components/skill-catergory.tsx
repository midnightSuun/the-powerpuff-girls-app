import { SkillItem } from "./skill-item"

export interface Skill {
    name: string
    mastery: string | number
}

interface SkillCategoryProps {
    title: string
    skills: Skill[]
    isDarkMode?: boolean
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
            <p className="mb-3 text-sm font-normal text-muted-foreground">
                {title}
            </p>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                {skills.map((skill) => (
                    <SkillItem
                        key={skill.name}
                        name={skill.name}
                        mastery={skill.mastery}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedSkills.includes(skill.name)}
                        onSelect={() => onSelectSkill?.(skill.name)}
                        onEdit={() => onEditSkill?.(skill)}
                    />
                ))}
            </div>
        </div>
    )
}
