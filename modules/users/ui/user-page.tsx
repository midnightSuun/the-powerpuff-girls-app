import { getUser } from "../api/get-user"
import { UserAvatar } from "./user-avatar"

type Props = {
    userId: string
}

export async function UserPage({ userId }: Props) {
    const user = await getUser(userId)

    return (
        <div>
            <h1>User</h1>
            <p>{user.email}</p>
            <p>{user.role}</p>
            <p>{user.profile.first_name}</p>
            <p>{user.profile.last_name}</p>
            <UserAvatar
                src={user.profile.avatar}
                firstName={user.profile.first_name}
                lastName={user.profile.last_name}
            />
        </div>
    )
}
