import { Suspense } from "react"

import { UserPage, UserProfileSkeleton } from "@/modules/users"

type Props = {
    params: Promise<{ locale: string; userId: string }>
}

async function UserContent({ params }: Props) {
    const { userId } = await params

    return <UserPage userId={userId} />
}

export default function UserTabRoute({ params }: Props) {
    return (
        <Suspense fallback={<UserProfileSkeleton />}>
            <UserContent params={params} />
        </Suspense>
    )
}
