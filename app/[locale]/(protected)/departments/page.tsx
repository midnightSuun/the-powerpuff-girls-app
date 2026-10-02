import { redirect } from "next/navigation"
import { Suspense } from "react"

import {
    getCurrentSession,
    getUserRole,
} from "@/modules/auth/helpers/get-current-session"
import { getAdminDepartments } from "@/modules/departments/api/departments"
import { AdminDepartmentsView } from "@/modules/departments/ui/components/admin-departments-view"

async function DepartmentsContent() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const userRole = await getUserRole()
    if (userRole !== "Admin") {
        redirect("/")
    }

    const departments = await getAdminDepartments()

    return (
        <div className="p-6">
            <AdminDepartmentsView initialDepartments={departments} />
        </div>
    )
}

export default function Page() {
    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <DepartmentsContent />
            </Suspense>
        </main>
    )
}
