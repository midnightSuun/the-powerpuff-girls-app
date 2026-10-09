import { redirect } from "next/navigation"

import { ProjectListSkeleton } from "@/components/project-list-skeleton"
import { readListSearch } from "@/lib/list-search-params"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getAvailableProjects } from "@/modules/cvs/api/projects"
import { AdminProjectsView } from "@/modules/projects/ui/admin-projects-view"
import { UsersTableFrame } from "@/modules/users"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function ProjectsContent({
    searchParams,
}: {
    searchParams: Props["searchParams"]
}) {
    const [session, resolvedSearchParams] = await Promise.all([
        getCurrentSession(),
        searchParams,
    ])

    if (!session) {
        redirect("/login")
    }

    if (session.role !== "Admin") {
        redirect("/")
    }

    const search = readListSearch(resolvedSearchParams.search)
    const projects = await getAvailableProjects()

    return (
        <div className="p-6">
            <AdminProjectsView projects={projects} search={search} />
        </div>
    )
}

export default function AdminProjectsPage({ searchParams }: Props) {
    return (
        <main className="min-h-screen w-full">
            <UsersTableFrame
                placeholder={
                    <div className="p-6">
                        <ProjectListSkeleton />
                    </div>
                }
            >
                <ProjectsContent searchParams={searchParams} />
            </UsersTableFrame>
        </main>
    )
}
