import { getUser } from "@/modules/users/api/get-user"

export async function getUserRole(userId: string) {
    const user = await getUser(userId)
    return user?.role
}
