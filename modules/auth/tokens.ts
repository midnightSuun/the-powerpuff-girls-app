import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/modules/consts"

const ACCESS_TOKEN_MAX_AGE = 9 * 60 // 9 min
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 - 60 // 7 days - 1 min

const baseCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
}

export const accessTokenCookie = (accessToken: string) => ({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
})

export const refreshTokenCookie = (refreshToken: string) => ({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
})

export const setTokens = async (accessToken: string, refreshToken: string) => {
    const cookieStore = await cookies()
    cookieStore.set(accessTokenCookie(accessToken))
    cookieStore.set(refreshTokenCookie(refreshToken))
}
