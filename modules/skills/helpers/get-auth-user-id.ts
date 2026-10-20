import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
export async function getAuthUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    if (!token) {
        return null
    }

    try {
        const payloadBase64 = token.split(".")[1]
        if (!payloadBase64) return null

        const decodedJson = Buffer.from(payloadBase64, "base64").toString(
            "utf-8",
        )
        const payload = JSON.parse(decodedJson)
        const userId = payload.sub ?? payload.id ?? payload.userId

        return userId ? String(userId) : null
    } catch (error) {
        console.error("Failed to decode auth token:", error)
        return null
    }
}
