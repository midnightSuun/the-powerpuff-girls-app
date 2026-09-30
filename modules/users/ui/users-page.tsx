import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { type PaginationSearchParams } from "@/lib/pagination-search-params"

import { UsersList } from "./users-list"

type Props = PaginationSearchParams

export async function UsersPage({ limit, page, search }: Props) {
    const t = await getTranslations("Users")

    return (
        <div>
            <PageHeader title={t("title")}>
                <SearchInput limit={limit} search={search} />
            </PageHeader>
            <Suspense
                key={page}
                fallback={
                    <p className="p-4 text-muted-foreground">{t("loading")}</p>
                }
            >
                <UsersList limit={limit} page={page} search={search} />
            </Suspense>
        </div>
    )
}
