import { getAvailableSkills, getUserSkills } from "../api/skills"
import { SkillsView } from "./components/skills-view"

interface SkillsProps {
    userId: string
    isDarkMode?: boolean
}

type UserSkill = {
    name: string
    mastery: string
    categoryId?: string | null
}

export async function Skills({ userId, isDarkMode = false }: SkillsProps) {
    const [{ cvId, skills: userSkills }, availableSkills] = await Promise.all([
        getUserSkills(userId),
        getAvailableSkills(),
    ])

    const typedSkills = (userSkills ?? []) as UserSkill[]

    const groupedSkills = typedSkills.reduce<Record<string, UserSkill[]>>(
        (acc, skill) => {
            const categoryKey = skill.categoryId ?? "Other"

            if (!acc[categoryKey]) {
                acc[categoryKey] = []
            }
            acc[categoryKey].push(skill)
            return acc
        },
        {},
    )

    const categories = Object.entries(groupedSkills).map(
        ([categoryId, skills]) => ({
            id: categoryId,
            title: getCategoryTitle(categoryId),
            skills,
        }),
    )

    return (
        <SkillsView
            cvId={cvId}
            categories={categories}
            typedSkills={typedSkills}
            availableSkills={availableSkills}
            isDarkMode={isDarkMode}
        />
    )
}

function getCategoryTitle(categoryId: string): string {
    const CATEGORY_MAP: Record<string, string> = {
        "1": "Programming languages",
        "2": "Frontend",
        "3": "Backend",
        "4": "Source control systems",
    }

    return CATEGORY_MAP[categoryId] ?? "General Skills"
}
