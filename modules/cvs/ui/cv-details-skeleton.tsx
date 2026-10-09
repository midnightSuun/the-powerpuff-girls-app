import { ProgressListSkeleton } from "@/components/progress-list-skeleton"
import { ProjectListSkeleton } from "@/components/project-list-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

import type { CvDetailsTab } from "./cvs-details-page-view"

type Props = {
    tab: CvDetailsTab
}

const DetailsFormSkeleton = () => {
    return (
        <div className="mx-auto flex w-full max-w-213 flex-col gap-5">
            <div className="flex flex-col gap-1">
                <Skeleton className="ml-2 h-3 w-16" />
                <Skeleton className="h-8 w-full rounded-none" />
            </div>
            <div className="flex flex-col gap-1">
                <Skeleton className="ml-2 h-3 w-20" />
                <Skeleton className="h-8 w-full rounded-none" />
            </div>
            <div className="flex flex-col gap-1">
                <Skeleton className="ml-2 h-3 w-24" />
                <Skeleton className="min-h-30 w-full rounded-none" />
            </div>
            <div className="flex justify-end pt-1">
                <Skeleton className="h-8 w-26.5 rounded-full" />
            </div>
        </div>
    )
}

const PreviewSkeleton = () => {
    return (
        <div className="mx-auto w-full max-w-275 px-5 pt-6 sm:px-10">
            <Skeleton className="mb-8 h-8 w-56" />
            <div className="grid grid-cols-1 gap-7 md:grid-cols-[27%_1fr] md:gap-8">
                <div className="space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
                <div className="space-y-3 border-l-2 border-border pl-5 sm:pl-7">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        </div>
    )
}

export const CvDetailsSkeleton = ({ tab }: Props) => {
    return (
        <main aria-busy="true" className="w-full min-w-0 px-4 pb-8 sm:px-6">
            <section className="w-full min-w-0 pt-4">
                {tab === "details" ? <DetailsFormSkeleton /> : null}
                {tab === "skills" ? (
                    <ProgressListSkeleton compact groups={2} />
                ) : null}
                {tab === "projects" ? <ProjectListSkeleton /> : null}
                {tab === "preview" ? <PreviewSkeleton /> : null}
            </section>
        </main>
    )
}
