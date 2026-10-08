import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { LoadingText } from "@/components/loading-text"
import { readListSearch } from "@/lib/list-search-params"
import {
    getCurrentSession,
    getUserRole,
} from "@/modules/auth/helpers/get-current-session"
import { getAdminLanguages } from "@/modules/languages/api/admin-languages"
import {
    getAvailableLanguages,
    getUserLanguages,
} from "@/modules/languages/api/languages"
import { AdminLanguagesView } from "@/modules/languages/ui/components/admin/admin-languages-view"
import { LanguagesPage } from "@/modules/languages/ui/languages-page"
import { UsersTableFrame } from "@/modules/users/ui/users-table-frame"
export const instant = false

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function LanguagesContent({
    searchParams,
}: {
    searchParams: Props["searchParams"]
}) {
    const [session, resolvedSearchParams] = await Promise.all([
        getCurrentSession(),
        searchParams,
    ])
    const search = readListSearch(resolvedSearchParams.search)

    if (!session) {
        redirect("/login")
    }

    const userRole = await getUserRole()
    if (userRole === "Admin") {
        const languages = await getAdminLanguages()

        return (
            <div className="p-6">
                <AdminLanguagesView
                    initialLanguages={languages}
                    search={search}
                />
            </div>
        )
    }

    const { userId } = session

    const [{ languages: userLanguages }, allSystemLanguages] =
        await Promise.all([getUserLanguages(userId), getAvailableLanguages()])

    return (
        <LanguagesPage
            initialUserLanguages={userLanguages}
            allSystemLanguages={allSystemLanguages}
            userId={userId}
            canManageLanguages
            search={search}
        />
    )
}

export default async function Page({ searchParams }: Props) {
    const t = await getTranslations("Common")

    return (
        <main className="min-h-screen w-full">
            <UsersTableFrame
                label={<LoadingText namespace="Common" />}
                placeholder={<div className="p-6">{t("loading")}</div>}
            >
                <LanguagesContent searchParams={searchParams} />
            </UsersTableFrame>
        </main>
    )
}
