import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

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

async function LanguagesContent() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const userRole = await getUserRole()
    if (userRole === "Admin") {
        const languages = await getAdminLanguages()

        return (
            <div className="p-6">
                <AdminLanguagesView initialLanguages={languages} />
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
        />
    )
}

export default async function Page() {
    const t = await getTranslations("Common")

    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">{t("loading")}</div>}>
                <LanguagesContent />
            </Suspense>
        </main>
    )
}
