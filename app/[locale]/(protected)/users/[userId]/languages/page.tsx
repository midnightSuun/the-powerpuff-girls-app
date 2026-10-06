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

export default async function UserLanguagesTab({ params }: PageProps) {
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
