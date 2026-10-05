import { getTranslations } from "next-intl/server"

import type { UserRole } from "@/gql"
import { getAvailableSkills } from "@/modules/skills/api/skills"

import type { Skill } from "./components/user/skill-category"
import { SkillsView } from "./components/user/skills-view"

interface SkillsProps {
    userSkills: {
        cvId: string
        skills: Skill[]
    }
    role?: UserRole | null
    compact?: boolean
    canManageSkills?: boolean
}

export async function Skills({
    userSkills,
    role,
    compact = false,
    canManageSkills: canManageSkillsOverride,
}: SkillsProps) {
    const t = await getTranslations("Skills")
    const canManageSkills = canManageSkillsOverride ?? role === "Employee"
    const availableSkills = canManageSkills ? await getAvailableSkills() : []

    const categoriesByTitle = new Map<
        string,
        { id: string; title: string; skills: Skill[] }
    >()

    for (const skill of userSkills.skills) {
        const categoryId = skill.categoryId ?? "other"
        const translationKey = `categories.${categoryId}` as const
        const title = t.has(translationKey)
            ? t(translationKey)
            : t("categories.other")
        const category = categoriesByTitle.get(title)

        if (category) {
            category.skills.push(skill)
        } else {
            categoriesByTitle.set(title, {
                id: categoryId,
                title,
                skills: [skill],
            })
        }
    }

    const categories = [...categoriesByTitle.values()]

    return (
        <SkillsView
            cvId={userSkills.cvId}
            categories={categories}
            typedSkills={userSkills.skills}
            availableSkills={availableSkills}
            canManageSkills={canManageSkills}
            compact={compact}
        />
    )
}
