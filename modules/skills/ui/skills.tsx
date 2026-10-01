import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import { getUserSkills } from "../api/skills"
import { SkillCategory } from "./components/skill-catergory"

interface SkillsProps {
    userId: string
    isDarkMode: boolean
}

export async function Skills({ userId, isDarkMode = false }: SkillsProps) {
    const userSkills = await getUserSkills(userId)
    const groupedSkills = userSkills.reduce<Record<string, typeof userSkills>>(
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
        <div className={`flex items-start gap-16`}>
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

                <div className="mt-8 flex items-center justify-end gap-6 text-xs font-medium tracking-wider text-gray-700">
                    <Button
                        variant="ghost"
                        className={`gap-2 border-transparent ${
                            isDarkMode
                                ? "text-[#C4C4C6]"
                                : "text-button-secondary-default"
                        }`}
                    >
                        <Plus className="h-5 w-5" />
                        ADD SKILL
                    </Button>

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
