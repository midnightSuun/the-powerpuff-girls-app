import { getTranslations } from "next-intl/server"

import type { HeaderCopy } from "./types"

export const getHeaderCopy = async () => {
    const [
        tUsers,
        tSkills,
        tLanguages,
        tSettings,
        tDepartments,
        tPositions,
        tProjects,
        tNav,
        tCvs,
        tCv,
        tCommon,
    ] = await Promise.all([
        getTranslations("Users"),
        getTranslations("Skills"),
        getTranslations("Languages"),
        getTranslations("Settings"),
        getTranslations("Admin.departments"),
        getTranslations("Admin.positions"),
        getTranslations("Admin.projects"),
        getTranslations("User.nav"),
        getTranslations("Cvs"),
        getTranslations("CV"),
        getTranslations("Common"),
    ])

    const copy: HeaderCopy = {
        users: tUsers("title"),
        skills: tSkills("title"),
        languages: tLanguages("title"),
        settings: tSettings("title"),
        departments: tDepartments("title"),
        positions: tPositions("title"),
        projects: tProjects("title"),
        profile: tNav("profile"),
        cvs: tCvs("title"),
        cvDetails: tCv("tabs.details").toLowerCase(),
        cvSkills: tCv("tabs.skills").toLowerCase(),
        cvProjects: tCv("tabs.projects").toLowerCase(),
        cvPreview: tCv("tabs.preview").toLowerCase(),
    }

    return {
        copy,
        breadcrumbLabel: tCommon("breadcrumb"),
    }
}
