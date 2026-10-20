import { Suspense } from "react"

import { ProgressListSkeleton } from "@/components/progress-list-skeleton"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import {
    getAvailableLanguages,
    getUserLanguages,
} from "@/modules/languages/api/languages"
import { LanguagesPage } from "@/modules/languages/ui/languages-page"

interface PageProps {
    params: Promise<{
        userId: string
        locale: string
    }>
}

async function UserLanguagesContent({ params }: PageProps) {
    const { userId } = await params

    const [userLanguagesData, allSystemLanguages, session] = await Promise.all([
        getUserLanguages(userId),
        getAvailableLanguages(),
        getCurrentSession(),
    ])

    const canManageLanguages =
        session?.role === "Admin" || session?.userId === userId

    return (
        <LanguagesPage
            userId={userId}
            initialUserLanguages={userLanguagesData.languages}
            allSystemLanguages={allSystemLanguages}
            canManageLanguages={canManageLanguages}
        />
    )
}

export default function UserLanguagesTab({ params }: PageProps) {
    return (
        <Suspense fallback={<ProgressListSkeleton groups={1} />}>
            <UserLanguagesContent params={params} />
        </Suspense>
    )
}
