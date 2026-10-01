import { redirect } from "next/navigation"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import {
    getAvailableLanguages,
    getUserLanguages,
} from "@/modules/languages/api/languages"
import { LanguagesPage } from "@/modules/languages/ui/languages-page"

export default async function Page() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const { userId } = session

    const [{ languages: userLanguages }, allSystemLanguages] =
        await Promise.all([getUserLanguages(userId), getAvailableLanguages()])

    return (
        <LanguagesPage
            initialUserLanguages={userLanguages}
            allSystemLanguages={allSystemLanguages}
            userId={userId}
        />
    )
}
