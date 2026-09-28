import { SkillItem } from "./skill-item"
export interface Skill {
    name: string
    mastery: string | number
}

interface SkillCategoryProps {
    title: string
    skills: Skill[]
}

export function SkillCategory({ title, skills }: SkillCategoryProps) {
    if (skills.length === 0) return null

    return (
        <div className="mb-6">
            <h3 className="mb-3 text-sm font-normal">{title}</h3>
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                {skills.map((skill) => (
                    <SkillItem
                        key={skill.name}
                        name={skill.name}
                        mastery={skill.mastery}
                    />
                ))}
            </div>
        </div>
    )
}
