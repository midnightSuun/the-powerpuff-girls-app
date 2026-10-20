import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { Suspense } from "react"

import { PaginationComponent } from "@/components/pagination"
import { routing } from "@/i18n/routing"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { CvsListSkeleton, CvsPageView } from "@/modules/cvs"
import { getAdminCvs, getUserCvs } from "@/modules/cvs/api/cvs"
import { parseCvSort } from "@/modules/cvs/cv-sort"

interface PageProps {
    searchParams: Promise<{
        search?: string
        limit?: string
        page?: string
        sortBy?: string
        sortOrder?: string
    }>
}

async function CvsContent({
    searchParams,
}: {
    searchParams: PageProps["searchParams"]
}) {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const params = await searchParams
    const search = params.search || ""
    const limit = Number(params.limit) || 10
    const page = Number(params.page) || 1
    const { sortBy, sortOrder } = parseCvSort(params)

    const isAdmin = session.role === "Admin"

    const paginationParams = {
        search,
        limit,
        page,
        sort_by: sortBy,
        sort_order: sortBy ? sortOrder : undefined,
    }

    const paginatedResult = isAdmin
        ? await getAdminCvs(paginationParams)
        : await getUserCvs(session.userId, paginationParams)

    const initialCvs = (paginatedResult?.items || []).map((cv) => ({
        ...cv,
        education: cv.education ?? "",
    }))
    const locale = await getLocale()
    const cvPath = locale === routing.defaultLocale ? "cv" : `${locale}/cv`

    return (
        <>
            <CvsPageView
                key={JSON.stringify(initialCvs)}
                initialCvs={initialCvs}
                isAdmin={isAdmin}
                search={search}
                limit={limit}
                sortBy={sortBy}
                sortOrder={sortOrder}
                showSearch={false}
            />
            <PaginationComponent
                totalPages={paginatedResult?.total_pages ?? 0}
                page={page}
                limit={limit}
                search={search}
                path={cvPath}
                sortBy={sortBy}
                sortOrder={sortOrder}
            />
        </>
    )
}

export default function CvsPage({ searchParams }: PageProps) {
    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<CvsListSkeleton showSearch={false} />}>
                <CvsContent searchParams={searchParams} />
            </Suspense>
        </main>
    )
}
