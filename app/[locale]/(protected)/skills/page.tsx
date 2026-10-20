import { redirect } from "next/navigation"

import { ProgressListSkeleton } from "@/components/progress-list-skeleton"
import {
    AdminTableSkeleton,
    type AdminTableSkeletonColumn,
} from "@/components/ui/admin-table-skeleton"
import { readListSearch } from "@/lib/list-search-params"
import { getUserRole } from "@/modules/auth/helpers/get-current-session"
import {
    getAdminSkills,
    getSkillCategories,
} from "@/modules/skills/api/admin-skills"
import { getUserSkills } from "@/modules/skills/api/skills"
import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { AdminSkillsView } from "@/modules/skills/ui/components/admin/admin-skills-view"
import { Skills } from "@/modules/skills/ui/skills"
import { UsersTableFrame } from "@/modules/users/ui/users-table-frame"

export const instant = false

const adminColumns: AdminTableSkeletonColumn[] = [
    {
        id: "name",
        headerClassName: "h-3 w-16",
        cellClassName: "h-4 w-32",
    },
    {
        id: "type",
        className: "hidden lg:table-cell",
        headerClassName: "h-3 w-12",
        cellClassName: "h-4 w-24",
    },
    {
        id: "category",
        headerClassName: "h-3 w-20",
        cellClassName: "h-4 w-28",
    },
]

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function SkillsContent({
    searchParams,
}: {
    searchParams: Props["searchParams"]
}) {
    const [userId, resolvedSearchParams] = await Promise.all([
        getAuthUserId(),
        searchParams,
    ])
    const search = readListSearch(resolvedSearchParams.search)

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
                    search={search}
                />
            </div>
        )
    }

    const userSkills = await getUserSkills(userId)

    return (
        <Skills
            userSkills={userSkills}
            role={userRole}
            canManageSkills
            search={search}
        />
    )
}

export default async function SkillsPage({ searchParams }: Props) {
    const role = await getUserRole()

    return (
        <main className="min-h-screen w-full">
            <UsersTableFrame
                placeholder={
                    role === "Admin" ? (
                        <div className="p-6">
                            <AdminTableSkeleton columns={adminColumns} />
                        </div>
                    ) : (
                        <ProgressListSkeleton />
                    )
                }
            >
                <SkillsContent searchParams={searchParams} />
            </UsersTableFrame>
        </main>
    )
}
