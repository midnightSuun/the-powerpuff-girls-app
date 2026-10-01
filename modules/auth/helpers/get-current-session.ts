import { jwtVerify } from "jose"
import { cookies } from "next/headers"

import type { UserRole } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { isUserRole } from "@/modules/auth/helpers/is-user-role"

export interface UserSession {
    userId: string
    role: UserRole | null
}

export async function getCurrentSession(): Promise<UserSession | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    if (!token) return null

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)

        const userId = (payload.userId || payload.sub || payload.id) as string
        if (!userId) return null

        const role = isUserRole(payload.role) ? payload.role : null

        return {
            userId,
            role,
        }
    } catch {
        return null
    }
}

export async function getUserRole(): Promise<UserRole | null> {
    const session = await getCurrentSession()
    return session?.role ?? null
}
