import { redirect } from "next/navigation"
import { Suspense } from "react"

import {
    getCurrentSession,
    getUserRole,
} from "@/modules/auth/helpers/get-current-session"
import { getAdminPositions } from "@/modules/positions/api/positions"
import { AdminPositionsView } from "@/modules/positions/ui/components/admin-positions-view"

async function PositionsContent() {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const userRole = await getUserRole()
    if (userRole !== "Admin") {
        redirect("/")
    }

    const positions = await getAdminPositions()

    return (
        <div className="p-6">
            <AdminPositionsView initialPositions={positions} />
        </div>
    )
}

export default function Page() {
    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <PositionsContent />
            </Suspense>
        </main>
    )
}
