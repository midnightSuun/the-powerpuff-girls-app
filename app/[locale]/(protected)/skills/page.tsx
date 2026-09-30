import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getUserSkills } from "@/modules/skills/api/skills"
import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { Skills } from "@/modules/skills/ui/skills"

async function SkillsContent() {
    const userId = await getAuthUserId()

    if (!userId) {
        redirect("/login")
    }

    const userSkills = await getUserSkills(userId)

    return <Skills userId={userId} userSkills={userSkills} />
}

export default function SkillsPage() {
    return (
        <main className="min-h-screen w-full">
            <Suspense
                fallback={<div className="p-6">Loading profile skills...</div>}
            >
                <SkillsContent />
            </Suspense>
        </main>
    )
}
