import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getUserRole } from "@/modules/auth/helpers/get-current-session"
import {
    getAdminSkills,
    getSkillCategories,
} from "@/modules/skills/api/admin-skills"
import { getUserSkills } from "@/modules/skills/api/skills"
import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { AdminSkillsView } from "@/modules/skills/ui/components/admin/admin-skills-view"
import { Skills } from "@/modules/skills/ui/skills"

async function SkillsContent() {
    const userId = await getAuthUserId()

    if (!userId) {
        redirect("/login")
    }

    const userRole = await getUserRole()
    if (userRole === "Admin") {
        const [skills, categories] = await Promise.all([
            getAdminSkills(),
            getSkillCategories(),
        ])

        return (
            <div className="p-6">
                <AdminSkillsView
                    initialSkills={skills}
                    categories={categories}
                />
            </div>
        )
    }

    const userSkills = await getUserSkills(userId)

    return <Skills userSkills={userSkills} role={userRole} />
}

export default function SkillsPage() {
    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <SkillsContent />
            </Suspense>
        </main>
    )
}
