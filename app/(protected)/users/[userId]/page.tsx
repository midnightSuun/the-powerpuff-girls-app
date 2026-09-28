import { Suspense } from "react"

import { UserPage } from "@/modules/users/ui/user-page"

type Props = {
    params: Promise<{ userId: string }>
}

async function UserRoute({ params }: Props) {
    const { userId } = await params

    return <UserPage userId={userId} />
}

export default function User({ params }: Props) {
    return (
        <Suspense fallback={<p className="p-4">Loading user...</p>}>
            <UserRoute params={params} />
        </Suspense>
    )
}
