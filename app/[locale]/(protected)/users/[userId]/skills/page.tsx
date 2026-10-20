import { Suspense } from "react"

import { ProgressListSkeleton } from "@/components/progress-list-skeleton"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getUserSkills } from "@/modules/skills/api/skills"
import { Skills } from "@/modules/skills/ui/skills"

interface SkillsPageProps {
    params: Promise<{
        userId: string
        locale: string
    }>
}

async function SkillsContent({ params }: SkillsPageProps) {
    const { userId } = await params

    const [userSkills, session] = await Promise.all([
        getUserSkills(userId),
        getCurrentSession(),
    ])
    const canManageSkills =
        session?.role === "Admin" || session?.userId === userId

    return (
        <div className="w-full">
            <Skills
                userSkills={userSkills}
                canManageSkills={canManageSkills}
                compact={false}
            />
        </div>
    )
}

export default function SkillsPage({ params }: SkillsPageProps) {
    return (
        <Suspense fallback={<ProgressListSkeleton />}>
            <SkillsContent params={params} />
        </Suspense>
    )
}
