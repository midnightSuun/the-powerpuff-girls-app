import { redirect } from "next/navigation"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { getProfileOptions } from "../api/get-profile-options"
import { getUser } from "../api/get-user"
import { UserProfileForm } from "./user-profile-form"

type Props = {
    userId: string
}

export async function UserPage({ userId }: Props) {
    const session = await getCurrentSession()
    if (!session) {
        redirect("/auth/login")
    }

    const user = await getUser(userId)

    const isOwner = session.userId === String(user.id)
    const isAdmin = session.role === "Admin"
    const canEdit = isOwner || isAdmin

    const profileOptions = canEdit
        ? await getProfileOptions()
        : { departments: [], positions: [] }

    return (
        <main className="min-h-0 w-full flex-1 bg-background px-6 py-6 text-foreground transition-colors duration-300">
            <UserProfileForm
                user={user}
                key={String(user.id)}
                currentUserId={session.userId}
                currentUserRole={session.role}
                departments={profileOptions.departments}
                positions={profileOptions.positions}
            />
        </main>
    )
}
