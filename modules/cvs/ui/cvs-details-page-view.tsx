"use client"

import { useRouter } from "next/navigation"
import React, { type ReactNode } from "react"

import type { CvDetailsItem, ProjectOption, UpdateCvDto } from "../types"
import { CvDetailsForm } from "./components/cv-details-form"
import { CvPreview } from "./components/cv-preview"
import { CvProjectsView } from "./components/cv-projects-view"

interface CvsDetailsPageViewProps {
    cv: CvDetailsItem
    activeTab: CvDetailsTab
    onUpdate: (data: UpdateCvDto) => Promise<void> | void
    skillsContent: ReactNode
    availableProjects: ProjectOption[]
    canManageProjects: boolean
}

export type CvDetailsTab = "details" | "skills" | "projects" | "preview"

export function CvsDetailsPageView({
    cv,
    activeTab,
    onUpdate,
    skillsContent,
    availableProjects,
    canManageProjects,
}: CvsDetailsPageViewProps) {
    const router = useRouter()

    const handleUpdateAndRefresh = async (data: UpdateCvDto) => {
        await onUpdate(data)
        router.refresh()
    }

    return (
        <main className="w-full min-w-0 px-4 pb-8 sm:px-6">
            <div className="w-full min-w-0">
                <section className="w-full min-w-0 pt-4">
                    {activeTab === "details" && (
                        <div className="w-full">
                            <CvDetailsForm
                                cv={cv}
                                onUpdate={handleUpdateAndRefresh}
                            />
                        </div>
                    )}

                    {activeTab === "skills" && skillsContent}

                    {activeTab === "projects" && (
                        <CvProjectsView
                            cvId={cv.id}
                            projects={cv.projects ?? []}
                            availableProjects={availableProjects}
                            canManageProjects={canManageProjects}
                        />
                    )}

                    {activeTab === "preview" && <CvPreview cv={cv} />}
                </section>
            </div>
        </main>
    )
}
