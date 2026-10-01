import { getTranslations } from "next-intl/server"

import type { UserRole } from "@/gql"
import { getAvailableSkills } from "@/modules/skills/api/skills"

import type { Skill } from "./components/skill-category"
import { SkillsView } from "./components/skills-view"

interface SkillsProps {
    userSkills: {
        cvId: string
        skills: Skill[]
    }
    role?: UserRole | null
}

export async function Skills({ userSkills, role }: SkillsProps) {
    const t = await getTranslations("Skills")
    const canManageSkills = role === "Employee"
    const availableSkills = canManageSkills ? await getAvailableSkills() : []

    const groupedSkills = userSkills.skills.reduce<Record<string, Skill[]>>(
        (acc, skill) => {
            const categoryKey = skill.categoryId ?? "other"

            if (!acc[categoryKey]) {
                acc[categoryKey] = []
            }
            acc[categoryKey].push(skill)
            return acc
        },
        {},
    )

    const categories = Object.entries(groupedSkills).map(
        ([categoryId, skills]) => {
            const translationKey = `categories.${categoryId}` as const

            return {
                id: categoryId,
                title: t.has(translationKey)
                    ? t(translationKey)
                    : t("categories.other"),
                skills,
            }
        },
    )

    return (
        <SkillsView
            cvId={userSkills.cvId}
            categories={categories}
            typedSkills={userSkills.skills}
            availableSkills={availableSkills}
            canManageSkills={canManageSkills}
        />
    )
}
