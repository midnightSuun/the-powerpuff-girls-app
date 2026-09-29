// app/(public)/skills/page.tsx
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { Skills } from "@/modules/skills/ui/skills"

export const instant = false

interface SkillsPageProps {
    isDarkMode?: boolean
}

async function SkillsContent({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const userId = await getAuthUserId()

    if (!userId) {
        redirect("/login")
    }

    return <Skills userId={userId} isDarkMode={isDarkMode} />
}

export default function SkillsPage({ isDarkMode = false }: SkillsPageProps) {
    return (
        <main
            className={`min-h-screen w-full transition-colors duration-300 ${
                isDarkMode
                    ? "bg-[#2E2E2E] text-[#F5F5F7]"
                    : "bg-white text-neutral-900"
            }`}
        >
            <Suspense
                fallback={<div className="p-6">Loading profile skills...</div>}
            >
                <SkillsContent isDarkMode={isDarkMode} />
            </Suspense>
        </main>
    )
}
