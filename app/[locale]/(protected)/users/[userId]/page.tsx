import { Suspense } from "react"

import { UserPage } from "@/modules/users"

type Props = {
    params: Promise<{ locale: string; userId: string }>
}

async function UserContent({ params }: Props) {
    const { userId } = await params

    return <UserPage userId={userId} />
}

export default function UserDetailRoute({ params }: Props) {
    return (
        <Suspense
            fallback={<p className="p-4 text-muted-foreground">Loading...</p>}
        >
            <UserContent params={params} />
        </Suspense>
    )
}
