import { redirect } from "next/navigation"
import { Suspense } from "react"

import { readListSearch } from "@/lib/list-search-params"
import {
    getCurrentSession,
    getUserRole,
} from "@/modules/auth/helpers/get-current-session"
import { getAdminPositions } from "@/modules/positions/api/positions"
import { AdminPositionsView } from "@/modules/positions/ui/components/admin-positions-view"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function PositionsContent({ searchParams }: Props) {
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

    const positions = await getAdminPositions(search)

    return (
        <div className="p-6">
            <AdminPositionsView initialPositions={positions} />
        </div>
    )
}

export default function Page({ searchParams }: Props) {
    return (
        <main className="min-h-screen w-full">
            <Suspense fallback={<div className="p-6">Loading...</div>}>
                <PositionsContent searchParams={searchParams} />
            </Suspense>
        </main>
    )
}
