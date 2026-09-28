import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { Skills } from "@/modules/skills/ui/skills"
export const instant = false

async function SkillsContent() {
    const userId = await getAuthUserId()

    if (!userId) {
        redirect("/login")
    }

    return <Skills userId={userId} />
}

export default function SkillsPage() {
    return (
        <main>
            <Suspense
                fallback={<div className="p-6">Loading profile skills...</div>}
            >
                <SkillsContent />
            </Suspense>
        </main>
    )
}
