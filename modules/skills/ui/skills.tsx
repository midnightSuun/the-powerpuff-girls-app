"use client"

import { Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import type { UserRole } from "@/gql"

import { SkillCategory } from "./components/skill-catergory"

interface Skill {
    name: string
    mastery: string | number
    categoryId?: string | null
}

interface SkillsProps {
    userId: string
    userSkills: Skill[]
    role?: UserRole | null
}

export function Skills({ userSkills, role }: SkillsProps) {
    const t = useTranslations("Skills")

    const canManageSkills = role === "Admin"

    const groupedSkills = userSkills.reduce<Record<string, Skill[]>>(
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
        <div className="flex items-start gap-16">
            <div className="flex-1 max-w-213 pl-50 pt-6">
                <div className="space-y-8">
                    {categories.map((category) => (
                        <SkillCategory
                            key={category.id}
                            title={category.title}
                            skills={category.skills}
                        />
                    ))}
                </div>

                {canManageSkills && (
                    <div className="mt-8 flex items-center justify-end gap-6 text-xs font-medium tracking-wider text-muted-foreground">
                        <Button
                            variant="ghost"
                            className="gap-2 border-transparent text-muted-foreground hover:text-foreground"
                        >
                            <Plus className="h-5 w-5" />
                            {t("actions.add")}
                        </Button>

                        <Button variant="primaryV2" className="gap-2">
                            <Trash2 className="h-5 w-5" />
                            {t("actions.remove")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
