import { getCurrentSession } from "./get-current-session"

export async function requireAdmin() {
    const session = await getCurrentSession()

    if (!session || session.role !== "Admin") {
        throw new Error("Access denied: Admin role required")
    }

    return session
}
