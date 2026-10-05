import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { type PaginationSearchParams } from "@/lib/pagination-search-params"

import { UsersList } from "./users-list"

type Props = PaginationSearchParams

export async function UsersPage({
    limit,
    page,
    search,
    sortBy,
    sortOrder,
}: Props) {
    const t = await getTranslations("Users")

    return (
        <Suspense
            key={`${page}-${sortBy ?? ""}-${sortOrder}`}
            fallback={
                <p className="p-4 text-muted-foreground">{t("loading")}</p>
            }
        >
            <UsersList
                limit={limit}
                page={page}
                search={search}
                sortBy={sortBy}
                sortOrder={sortOrder}
            />
        </Suspense>
    )
}
