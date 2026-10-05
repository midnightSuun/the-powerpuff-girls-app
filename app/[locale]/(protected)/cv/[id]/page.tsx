import { Suspense } from "react"

import { CvDetailsPage as CvDetailsContent } from "@/modules/cvs/ui/cv-details-page"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CvDetailsPage({ params }: PageProps) {
    const { id } = await params

    return (
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <CvDetailsContent id={id} activeTab="details" />
        </Suspense>
    )
}
