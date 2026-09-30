import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { getAvailableSkills, getUserSkills } from "../api/skills"
import { AddSkillButton } from "./components/add-skill-button"
import { SkillCategory } from "./components/skill-catergory"

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
        <div className="flex items-start gap-16">
            <div className="flex-1 max-w-[852px] pl-50 pt-6">
                <div className="space-y-8">
                    {categories.map((category) => (
                        <SkillCategory
                            key={category.id}
                            title={category.title}
                            skills={category.skills}
                        />
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-end gap-6 text-xs font-medium tracking-wider text-gray-700">
                    <AddSkillButton
                        cvId={cvId}
                        isDarkMode={isDarkMode}
                        existingSkills={typedSkills}
                        availableSkills={availableSkills}
                    />

                    <Button variant="primaryV2" className="gap-2">
                        <Trash2 className="h-5 w-5" />
                        REMOVE SKILLS
                    </Button>
                </div>
            </div>
        </div>
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
