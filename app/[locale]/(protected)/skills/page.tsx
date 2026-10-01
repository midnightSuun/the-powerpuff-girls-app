import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { getUserRole } from "@/modules/auth/helpers/get-user-role"
import { getUserSkills } from "@/modules/skills/api/skills"
import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { Skills } from "@/modules/skills/ui/skills"

async function SkillsContent() {
    const userId = await getAuthUserId()

    if (!userId) {
        redirect("/login")
    }

    const [userSkills, userRole] = await Promise.all([
        getUserSkills(userId),
        getUserRole(),
    ])

    return <Skills userSkills={userSkills} role={userRole} />
}

export default async function SkillsPage() {
    const t = await getTranslations("Skills")

    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">{t("loading")}</div>}>
                <SkillsContent />
            </Suspense>
        </main>
    )
}
