import { getUsers } from "../api/get-users"

export async function UsersPage() {
    const { users } = await getUsers(10, 1, "")

    return (
        <ul>
            {users.map((user) => (
                <li key={user.id}>{user.email}</li>
            ))}
        </ul>
    )
}
