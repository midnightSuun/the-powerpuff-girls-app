import { getTranslations } from "next-intl/server"

import { getAvailableSkills, getUserSkills } from "../api/skills"
import { SkillOption } from "./components/add-skill-modal"
import { SkillsView } from "./components/skills-view"

interface Skill {
    name: string
    mastery: string | number
    categoryId?: string | null
}

interface SkillsProps {
    userId: string
    userSkills?: Skill[]
    isDarkMode?: boolean
}

type UserSkill = {
    name: string
    mastery: string
    categoryId?: string | null
}

export async function Skills({
    userId,
    userSkills: initialUserSkills,
    isDarkMode = false,
}: SkillsProps) {
    const t = await getTranslations("Skills")

    let cvId = ""
    let typedSkills: UserSkill[] = []
    let availableSkills: SkillOption[] = []

    if (initialUserSkills && Array.isArray(initialUserSkills)) {
        typedSkills = initialUserSkills as UserSkill[]
    } else if (userId) {
        try {
            const [userData, fetchedAvailable] = await Promise.all([
                getUserSkills(userId),
                getAvailableSkills(),
            ])
            cvId = userData?.cvId ?? ""
            typedSkills = Array.isArray(userData?.skills)
                ? (userData.skills as UserSkill[])
                : []
            availableSkills = fetchedAvailable ?? []
        } catch (error) {
            console.error("Failed to load user skills:", error)
            typedSkills = []
        }
    }

    const safeSkills = Array.isArray(typedSkills) ? typedSkills : []

    const groupedSkills = safeSkills.reduce<Record<string, UserSkill[]>>(
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

            const title = t.has(translationKey)
                ? t(translationKey)
                : t("categories.other")

            return {
                id: categoryId,
                title,
                skills,
            }
        },
    )

    return (
        <SkillsView
            cvId={cvId}
            categories={categories}
            typedSkills={safeSkills}
            availableSkills={availableSkills}
            isDarkMode={isDarkMode}
        />
    )
}
