import { jwtVerify } from "jose"
import { cookies } from "next/headers"

import type { UserRole } from "@/gql"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { isUserRole } from "@/modules/auth/helpers/is-user-role"

export async function getUserRole(): Promise<UserRole | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    if (!token) return null

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        return isUserRole(payload.role) ? payload.role : null
    } catch {
        return null
    }
}
