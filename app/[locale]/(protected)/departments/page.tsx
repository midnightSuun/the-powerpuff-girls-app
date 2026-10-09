import { redirect } from "next/navigation"
import { Suspense } from "react"

import { readListSearch } from "@/lib/list-search-params"
import {
    getCurrentSession,
    getUserRole,
} from "@/modules/auth/helpers/get-current-session"
import { getAdminDepartments } from "@/modules/departments/api/departments"
import { AdminDepartmentsView } from "@/modules/departments/ui/components/admin-departments-view"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}
async function DepartmentsContent({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams
    const search = readListSearch(resolvedSearchParams.search)
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const userRole = await getUserRole()
    if (userRole !== "Admin") {
        redirect("/")
    }

    const departments = await getAdminDepartments(search)

    return (
        <div className="p-6">
            <AdminDepartmentsView initialDepartments={departments} />
        </div>
    )
}

export default function Page({ searchParams }: Props) {
    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <DepartmentsContent searchParams={searchParams} />
            </Suspense>
        </main>
    )
}
