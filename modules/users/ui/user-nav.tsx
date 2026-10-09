import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"

import { getUser } from "../api/get-user"
import { NavUserMenu } from "./components/nav-user-menu"

export async function NavUser() {
    const userId = await getAuthUserId()

    if (!userId) {
        return null
    }

    const user = await getUser(userId)

    return (
        <NavUserMenu
            user={{
                id: user.id,
                email: user.email,
                firstName: user.profile.first_name,
                lastName: user.profile.last_name,
                avatar: user.profile.avatar,
            }}
        />
    )
}
