import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { PaginationComponent } from "@/components/pagination"
import { routing } from "@/i18n/routing"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getAdminCvs, getUserCvs } from "@/modules/cvs/api/cvs"
import { CvsPageView } from "@/modules/cvs/ui/cvs-page-view"

interface PageProps {
    searchParams: Promise<{
        search?: string
        limit?: string
        page?: string
        sort_order?: string
        sort_by?: string
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
    const sort_order = params.sort_order
    const sort_by = params.sort_by

    const isAdmin = session.role === "Admin"

    const paginationParams = {
        search,
        limit,
        page,
        sort_order,
        sort_by,
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
            />
            <PaginationComponent
                totalPages={paginatedResult?.total_pages ?? 0}
                page={page}
                limit={limit}
                search={search}
                path={cvPath}
            />
        </>
    )
}

export default async function CvsPage({ searchParams }: PageProps) {
    const t = await getTranslations("Common")

    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">{t("loading")}</div>}>
                <CvsContent searchParams={searchParams} />
            </Suspense>
        </main>
    )
}
