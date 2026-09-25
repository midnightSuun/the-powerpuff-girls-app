import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { refreshTokens } from "@/modules/auth/api/refresh"
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
} from "@/modules/auth/consts"

import { isAuthorized } from "./modules/auth/helpers/is-authorized"
import {
    accessTokenCookie,
    refreshTokenCookie,
} from "./modules/auth/helpers/tokens"

const clearTokens = (response: NextResponse) => {
    response.cookies.delete(ACCESS_TOKEN_COOKIE)
    response.cookies.delete(REFRESH_TOKEN_COOKIE)
    return response
}

const refreshSession = async (request: NextRequest) => {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

    if (accessToken || !refreshToken) {
        return null
    }

    try {
        const tokens = await refreshTokens(refreshToken)
        request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken)
        request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken)
        return tokens
    } catch {
        request.cookies.delete(ACCESS_TOKEN_COOKIE)
        request.cookies.delete(REFRESH_TOKEN_COOKIE)
        return "failed" as const
    }
}

function isPublic(route: string) {
    return ["/login", "/register", "/logout"].includes(route)
}

export async function proxy(request: NextRequest) {
    const tokens = await refreshSession(request)
    const targetPage = request.nextUrl.pathname

    if (tokens === "failed") {
        const response = isPublic(targetPage)
            ? NextResponse.next()
            : NextResponse.redirect(new URL("/login", request.url))

        return clearTokens(response)
    }

    const authorized = isAuthorized(request.cookies)

    const response =
        authorized && isPublic(targetPage)
            ? NextResponse.redirect(new URL("/", request.url))
            : !authorized && !isPublic(targetPage)
              ? NextResponse.redirect(new URL("/login", request.url))
              : NextResponse.next({
                    request: {
                        headers: new Headers(request.headers),
                    },
                })

    if (tokens) {
        response.cookies.set(accessTokenCookie(tokens.accessToken))
        response.cookies.set(refreshTokenCookie(tokens.refreshToken))
    }

    return response
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
}
