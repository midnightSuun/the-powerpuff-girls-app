"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CvDetailsItem } from "@/modules/cvs/types"

import { useCvPreview } from "../../hooks/use-cv-preview"

interface CvPreviewProps {
    cv: CvDetailsItem
}

export function CvPreview({ cv }: CvPreviewProps) {
    const {
        t,
        projects,
        skills,
        languages,
        domains,
        categories,
        getFormattedPeriod,
        getMasteryLabel,
        getLanguageProficiencyLabel,
    } = useCvPreview(cv)

    return (
        <article className="cv-preview mx-auto w-full max-w-275 px-5 pb-12 pt-6 text-[#292929] dark:text-foreground sm:px-10 print:max-w-none print:px-0 print:pt-0">
            <div className="mb-8 flex justify-end print:hidden">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => window.print()}
                    className="h-9 rounded-full border-[#d7352c] px-5 text-xs font-medium text-[#d7352c] hover:bg-[#d7352c]/5 hover:text-[#d7352c] dark:border-[#f06b65] dark:text-[#f06b65] dark:hover:bg-[#f06b65]/10 dark:hover:text-[#ff8a84]"
                >
                    <Download aria-hidden="true" className="size-4" />
                    {t("exportPdf")}
                </Button>
            </div>

            <header className="mb-8">
                <h1 className="text-3xl font-normal tracking-tight">
                    {cv.name}
                </h1>
                {cv.education ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {cv.education}
                    </p>
                ) : null}
            </header>

            <section className="grid grid-cols-1 gap-7 md:grid-cols-[27%_1fr] md:gap-8">
                <aside className="space-y-5 text-xs">
                    {cv.education ? (
                        <div>
                            <h2 className="mb-1 font-semibold">
                                {t("education")}
                            </h2>
                            <p className="text-muted-foreground">
                                {cv.education}
                            </p>
                        </div>
                    ) : null}
                    {languages.length > 0 ? (
                        <div>
                            <h2 className="mb-1 font-semibold">
                                {t("languageProficiency")}
                            </h2>
                            <ul className="space-y-1 text-muted-foreground">
                                {languages.map((language) => (
                                    <li key={language.name}>
                                        {language.name} —{" "}
                                        {getLanguageProficiencyLabel(
                                            language.proficiency,
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {domains.length > 0 ? (
                        <div>
                            <h2 className="mb-1 font-semibold">
                                {t("domains")}
                            </h2>
                            <p className="text-muted-foreground">
                                {domains.join(", ")}
                            </p>
                        </div>
                    ) : null}
                </aside>

                <div className="border-l-2 border-[#ed9999] pl-5 text-xs leading-[1.55] dark:border-[#8f4a4a] sm:pl-7">
                    <h2 className="mb-2 font-semibold">{t("profile")}</h2>
                    <p className="whitespace-pre-line text-muted-foreground">
                        {cv.description || t("noDescription")}
                    </p>
                </div>
            </section>

            {projects.length > 0 ? (
                <section className="mt-10">
                    <h2 className="mb-6 text-2xl font-normal">
                        {t("projects")}
                    </h2>
                    <div className="space-y-6">
                        {projects.map((project) => (
                            <article
                                key={project.id}
                                className="grid grid-cols-1 gap-5 border-l-2 border-[#ed9999] pl-5 dark:border-[#8f4a4a] sm:grid-cols-[27%_1fr] sm:gap-8 sm:pl-7"
                            >
                                <div className="text-xs">
                                    <h3 className="font-semibold uppercase text-[#d7352c]">
                                        {project.name}
                                    </h3>
                                    {project.domain ? (
                                        <p className="mt-1 text-muted-foreground">
                                            {project.domain}
                                        </p>
                                    ) : null}
                                    {project.description ? (
                                        <p className="mt-2 leading-normal text-muted-foreground">
                                            {project.description}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="space-y-3 text-xs">
                                    {project.roles.length > 0 ? (
                                        <div>
                                            <h3 className="mb-1 font-semibold">
                                                {t("projectRoles")}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {project.roles.join(", ")}
                                            </p>
                                        </div>
                                    ) : null}
                                    <div>
                                        <h3 className="mb-1 font-semibold">
                                            {t("period")}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {getFormattedPeriod(project)}
                                        </p>
                                    </div>
                                    {project.responsibilities.length > 0 ? (
                                        <div>
                                            <h3 className="mb-1 font-semibold">
                                                {t("responsibilities")}
                                            </h3>
                                            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                                                {project.responsibilities.map(
                                                    (responsibility, index) => (
                                                        <li
                                                            key={`${project.id}-${index}`}
                                                        >
                                                            {responsibility}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    ) : null}
                                    {project.environment.length > 0 ? (
                                        <div>
                                            <h3 className="mb-1 font-semibold">
                                                {t("environment")}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {project.environment.join(", ")}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="mt-10">
                <h2 className="mb-5 text-2xl font-normal">
                    {t("professionalSkills")}
                </h2>
                {skills.length > 0 ? (
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#ed9999] text-[10px] uppercase dark:border-[#8f4a4a]">
                                <th className="w-[30%] px-2 py-2 font-medium">
                                    {t("skills")}
                                </th>
                                <th className="px-2 py-2 font-medium">
                                    {t("skillName")}
                                </th>
                                <th className="w-[22%] px-2 py-2 font-medium">
                                    {t("mastery")}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...categories.entries()].map(
                                ([category, categorySkills]) =>
                                    categorySkills.map((skill, index) => (
                                        <tr
                                            key={`${category}-${skill.name}`}
                                            className="border-b border-[#d5d5d5] dark:border-border"
                                        >
                                            <td className="px-2 py-2 font-medium text-[#d7352c] dark:text-[#f06b65]">
                                                {index === 0 ? category : null}
                                            </td>
                                            <td className="px-2 py-2">
                                                {skill.name}
                                            </td>
                                            <td className="px-2 py-2 text-center text-muted-foreground">
                                                {getMasteryLabel(skill.mastery)}
                                            </td>
                                        </tr>
                                    )),
                            )}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        {t("noSkills")}
                    </p>
                )}
            </section>
        </article>
    )
}
