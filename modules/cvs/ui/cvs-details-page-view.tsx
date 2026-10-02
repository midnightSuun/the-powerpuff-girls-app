"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import React, { type ReactNode, useState } from "react"

import type { CvDetailsItem, ProjectOption, UpdateCvDto } from "../types"
import { CvDetailsForm } from "./components/cv-details-form"
import { CvProjectsView } from "./components/cv-projects-view"

interface CvsDetailsPageViewProps {
    cv: CvDetailsItem
    onUpdate: (data: UpdateCvDto) => Promise<void> | void
    skillsContent: ReactNode
    availableProjects: ProjectOption[]
    canManageProjects: boolean
}

export function CvsDetailsPageView({
    cv,
    onUpdate,
    skillsContent,
    availableProjects,
    canManageProjects,
}: CvsDetailsPageViewProps) {
    const router = useRouter()
    const t = useTranslations("CV")
    const [activeTab, setActiveTab] = useState<
        "DETAILS" | "SKILLS" | "PROJECTS" | "PREVIEW"
    >("DETAILS")

    const handleUpdateAndRefresh = async (data: UpdateCvDto) => {
        await onUpdate(data)
        router.refresh()
    }

    const tabs = [
        { id: "DETAILS", label: t("tabs.details") },
        { id: "SKILLS", label: t("tabs.skills") },
        { id: "PROJECTS", label: t("tabs.projects") },
        { id: "PREVIEW", label: t("tabs.preview") },
    ] as const

    return (
        <main className="w-full min-w-0 px-4 pb-8 sm:px-6">
            <div className="w-full min-w-0">
                <div
                    role="tablist"
                    aria-label={t("tabListLabel")}
                    className="flex h-11 w-full border-b border-border"
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                id={`cv-tab-${tab.id.toLowerCase()}`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`cv-panel-${tab.id.toLowerCase()}`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative h-11 min-w-24 flex-1 px-4 text-[10px] font-medium tracking-[0.02em] transition-colors sm:flex-none sm:min-w-35 ${
                                    isActive
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                                {isActive && (
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#d7352c]" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {tabs.map((tab) => (
                    <section
                        key={tab.id}
                        id={`cv-panel-${tab.id.toLowerCase()}`}
                        role="tabpanel"
                        aria-labelledby={`cv-tab-${tab.id.toLowerCase()}`}
                        hidden={activeTab !== tab.id}
                        className="w-full min-w-0 pt-4"
                    >
                        {tab.id === "DETAILS" && (
                            <div className="w-full">
                                <CvDetailsForm
                                    cv={cv}
                                    onUpdate={handleUpdateAndRefresh}
                                />
                            </div>
                        )}

                        {tab.id === "SKILLS" && skillsContent}

                        {tab.id === "PROJECTS" && (
                            <CvProjectsView
                                cvId={cv.id}
                                projects={cv.projects ?? []}
                                availableProjects={availableProjects}
                                canManageProjects={canManageProjects}
                            />
                        )}

                        {tab.id === "PREVIEW" && (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                {t("previewUnavailable")}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </main>
    )
}
