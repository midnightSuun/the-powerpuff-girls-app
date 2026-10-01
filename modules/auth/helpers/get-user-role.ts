import { jwtVerify } from "jose"
import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

export async function getRoleFromCookie() {
    const cookieStore = await cookies()
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    if (!token) return null

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        return payload.role as string
    } catch {
        return null
    }
}
