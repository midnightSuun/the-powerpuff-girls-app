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

const FRONTEND_SKILLS = new Set([
    "react",
    "redux",
    "mobx",
    "three.js",
    "html",
    "css",
    "css3",
    "scss",
    "rxjs",
    "storybook",
    "react query",
    "vue",
    "angular",
    "next.js",
])

const BACKEND_SKILLS = new Set([
    "node.js",
    "nest.js",
    "nestjs",
    "graphql",
    "redis",
    "mongodb",
    "postgresql",
    "grpc",
    "express",
    "keycloak",
])

const PROGRAMMING_LANGUAGES = new Set([
    "javascript",
    "typescript",
    "python",
    "java",
    "c#",
    "c++",
    "go",
    "php",
])

function resolveCategoryId(
    skill: Skill & { category?: string | null },
): string {
    if (skill.categoryId && skill.categoryId !== "other") {
        return skill.categoryId
    }
    if (skill.category && skill.category !== "other") {
        return skill.category
    }

    const nameLower = skill.name.toLowerCase()
    if (FRONTEND_SKILLS.has(nameLower)) return "2"
    if (BACKEND_SKILLS.has(nameLower)) return "9"
    if (PROGRAMMING_LANGUAGES.has(nameLower)) return "1"

    return "other"
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
        const categoryId = resolveCategoryId(skill)
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
