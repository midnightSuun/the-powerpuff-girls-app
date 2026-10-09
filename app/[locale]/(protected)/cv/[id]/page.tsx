import { Suspense } from "react"

import { CvDetailsPage as CvDetailsContent } from "@/modules/cvs"
import { CvDetailsSkeleton } from "@/modules/cvs"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CvDetailsPage({ params }: PageProps) {
    const { id } = await params

    return (
        <Suspense fallback={<CvDetailsSkeleton tab="details" />}>
            <CvDetailsContent id={id} activeTab="details" />
        </Suspense>
    )
}
