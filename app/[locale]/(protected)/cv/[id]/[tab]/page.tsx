import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CvDetailsPage } from "@/modules/cvs/ui/cv-details-page"
import type { CvDetailsTab } from "@/modules/cvs/ui/cvs-details-page-view"

interface PageProps {
    params: Promise<{ id: string; tab: string }>
}

const CV_TABS: Record<string, CvDetailsTab> = {
    skills: "skills",
    projects: "projects",
    preview: "preview",
}

export default async function CvTabPage({ params }: PageProps) {
    const { id, tab } = await params
    const activeTab = CV_TABS[tab]

    if (!activeTab) notFound()

    return (
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <CvDetailsPage id={id} activeTab={activeTab} />
        </Suspense>
    )
}
