import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { ProjectListSkeleton } from "@/components/project-list-skeleton"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getAvailableProjects } from "@/modules/cvs/api/projects"
import { AdminProjectsView } from "@/modules/projects/ui/admin-projects-view"

async function ProjectsContent() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    if (session.role !== "Admin") {
        redirect("/")
    }

    const [projects, tAdmin] = await Promise.all([
        getAvailableProjects(),
        getTranslations("Admin.projects"),
    ])

    return (
        <div className="p-6">
            <AdminProjectsView
                projects={projects}
                searchPlaceholder={tAdmin("search")}
                searchLabel={tAdmin("searchLabel")}
            />
        </div>
    )
}

export default function AdminProjectsPage() {
    return (
        <main className="min-h-screen w-full">
            <Suspense
                fallback={
                    <div className="p-6">
                        <ProjectListSkeleton />
                    </div>
                }
            >
                <ProjectsContent />
            </Suspense>
        </main>
    )
}
