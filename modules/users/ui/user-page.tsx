import { getUser } from "../api/get-user"

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
            <img
                src={user.profile.avatar ?? ""}
                alt={user.profile.first_name ?? ""}
                className="w-25 h-30"
            />
        </div>
    )
}
