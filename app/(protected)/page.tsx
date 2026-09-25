import { Suspense } from "react"

import { UsersPage } from "@/modules/users"

export default function Home() {
    return (
        <Suspense fallback={<p className="p-4">Loading users...</p>}>
            <UsersPage />
        </Suspense>
    )
}
