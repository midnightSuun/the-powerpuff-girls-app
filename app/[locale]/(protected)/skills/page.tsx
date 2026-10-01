import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LoadingText } from "@/components/loading-text"
import { getUserRole } from "@/modules/auth/helpers/get-current-session"
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

export default function SkillsPage() {
    return (
        <main className="min-h-screen w-full">
            <Suspense
                fallback={
                    <div className="p-6">
                        <LoadingText namespace="Skills" />
                    </div>
                }
            >
                <SkillsContent />
            </Suspense>
        </main>
    )
}
