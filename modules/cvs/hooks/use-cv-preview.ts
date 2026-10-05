import { useLocale, useTranslations } from "next-intl"

import type { Mastery, Proficiency } from "@/gql/generated/graphql"
import type { CvDetailsItem, CvProjectItem } from "@/modules/cvs/types"

const masteryKey = {
    Novice: "novice",
    Advanced: "advanced",
    Competent: "competent",
    Proficient: "proficient",
    Expert: "expert",
} as const

function formatPeriod(project: CvProjectItem, locale: string, tillNow: string) {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    })
    const formatDate = (value: string | null) => {
        if (!value) return tillNow
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
    }

    return `${formatDate(project.start_date)} – ${formatDate(project.end_date)}`
}

export function useCvPreview(cv: CvDetailsItem) {
    const locale = useLocale()
    const t = useTranslations("CV.preview")
    const tSkills = useTranslations("Skills")
    const tLanguages = useTranslations("Languages")

    const projects = cv.projects ?? []
    const skills = cv.skills ?? []
    const languages = cv.languages ?? []

    const domains = [...new Set(projects.map((project) => project.domain))]
    const categories = new Map<string, typeof skills>()

    for (const skill of skills) {
        const categoryId = skill.categoryId ?? "other"
        const translationKey = `categories.${categoryId}` as const
        const title = tSkills.has(translationKey)
            ? tSkills(translationKey)
            : tSkills("categories.other")
        const categorySkills = categories.get(title) ?? []
        categorySkills.push(skill)
        categories.set(title, categorySkills)
    }

    const getFormattedPeriod = (project: CvProjectItem) =>
        formatPeriod(project, locale, t("tillNow"))

    const getMasteryLabel = (mastery: Mastery) => {
        const key = masteryKey[mastery as keyof typeof masteryKey]
        return key ? tSkills(`masteryLevels.${key}`) : mastery
    }

    const getLanguageProficiencyLabel = (proficiency: Proficiency | string) =>
        tLanguages(`proficiencyLevels.${proficiency as Proficiency}`)

    return {
        t,
        tSkills,
        projects,
        skills,
        languages,
        domains,
        categories,
        getFormattedPeriod,
        getMasteryLabel,
        getLanguageProficiencyLabel,
    }
}
