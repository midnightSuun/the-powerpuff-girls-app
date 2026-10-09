import { Suspense } from "react"

import { PaginationComponent } from "@/components/pagination"
import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getUserCvs } from "@/modules/cvs/api/cvs"
import { CvsListSkeleton } from "@/modules/cvs/ui/cvs-list-skeleton"
import { CvsPageView } from "@/modules/cvs/ui/cvs-page-view"

interface PageProps {
    params: Promise<{ locale: string; userId: string }>
    searchParams: Promise<{
        search?: string
        limit?: string
        page?: string
        sort_order?: string
        sort_by?: string
        sortOrder?: string
        sortBy?: string
    }>
}

async function UserCvsContent({ params, searchParams }: PageProps) {
    const [{ locale, userId }, query, session] = await Promise.all([
        params,
        searchParams,
        getCurrentSession(),
    ])

    if (!session) {
        redirect({ href: "/auth/login", locale })
        return null
    }

    if (session.role !== "Admin" && session.userId !== userId) {
        redirect({ href: `/users/${userId}/profile`, locale })
        return null
    }

    const pageValue = Number(query.page)
    const limitValue = Number(query.limit)
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
    const limit =
        Number.isInteger(limitValue) && limitValue > 0 ? limitValue : 10
    const search = query.search ?? ""
    const sortBy = query.sortBy ?? query.sort_by
    const sortOrder = query.sortOrder ?? query.sort_order

    const paginatedResult = await getUserCvs(userId, {
        page,
        limit,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
    })

    const initialCvs = (paginatedResult?.items ?? []).map((cv) => ({
        ...cv,
        education: cv.education ?? "",
    }))
    const cvPath =
        locale === routing.defaultLocale
            ? `users/${userId}/cv`
            : `${locale}/users/${userId}/cv`

    return (
        <main className="min-h-0 w-full flex-1 bg-background px-6 py-6 text-foreground transition-colors duration-300">
            <CvsPageView
                key={JSON.stringify(initialCvs)}
                initialCvs={initialCvs}
                isAdmin={session.role === "Admin"}
                search={search}
                limit={limit}
                targetUserId={userId}
            />
            <PaginationComponent
                totalPages={paginatedResult?.total_pages ?? 0}
                page={page}
                limit={limit}
                search={search}
                path={cvPath}
                sortBy={sortBy}
                sortOrder={sortOrder === "desc" ? "desc" : "asc"}
            />
        </main>
    )
}

export default function UserCvsPage({ params, searchParams }: PageProps) {
    return (
        <Suspense
            fallback={
                <main className="min-h-0 w-full flex-1 bg-background px-6 py-6 text-foreground">
                    <CvsListSkeleton />
                </main>
            }
        >
            <UserCvsContent params={params} searchParams={searchParams} />
        </Suspense>
    )
}
