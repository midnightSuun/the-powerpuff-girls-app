import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"

import { refreshTokens } from "@/modules/auth/api/refresh"
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
} from "@/modules/auth/consts"

import { routing } from "./i18n/routing"
import { isAuthorized } from "./modules/auth/helpers/is-authorized"
import {
    accessTokenCookie,
    refreshTokenCookie,
} from "./modules/auth/helpers/tokens"

const intlMiddleware = createMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    localePrefix: "as-needed",
})

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

const guestOnlyRoutes = ["/login", "/register", "/forgot-password"]
const publicRoutes = [
    ...guestOnlyRoutes,
    "/logout",
    "/reset-password",
    "/verify-email",
]

function isPublic(route: string) {
    return publicRoutes.includes(route)
}

function isGuestOnly(route: string) {
    return guestOnlyRoutes.includes(route)
}

function getCleanPathname(pathname: string) {
    const segments = pathname.split("/")

    if (
        routing.locales.includes(
            segments[1] as (typeof routing.locales)[number],
        )
    ) {
        segments.splice(1, 1)
    }
    return segments.join("/") || "/"
}

function getLocale(pathname: string) {
    const segment = pathname.split("/")[1]

    if (routing.locales.includes(segment as (typeof routing.locales)[number])) {
        return segment
    }

    return routing.defaultLocale
}

function localizedPath(locale: string, pathname: string) {
    if (locale === routing.defaultLocale) {
        return pathname
    }

    if (pathname === "/") {
        return `/${locale}`
    }

    return `/${locale}${pathname}`
}

function pathnameHeaders(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-pathname", getCleanPathname(request.nextUrl.pathname))

    return requestHeaders
}

function nextWithPathname(request: NextRequest) {
    return NextResponse.next({
        request: {
            headers: pathnameHeaders(request),
        },
    })
}

export async function proxy(request: NextRequest) {
    const originalPathname = request.nextUrl.pathname
    const targetPage = getCleanPathname(originalPathname)
    const currentLocale = getLocale(originalPathname)

    const tokens = await refreshSession(request)

    if (tokens === "failed") {
        const response = isPublic(targetPage)
            ? nextWithPathname(request)
            : NextResponse.redirect(
                  new URL(localizedPath(currentLocale, "/login"), request.url),
              )

        return clearTokens(response)
    }

    const authorized = isAuthorized(request.cookies)

    let customResponse: NextResponse | null = null

    if (authorized && isGuestOnly(targetPage)) {
        customResponse = NextResponse.redirect(
            new URL(localizedPath(currentLocale, "/"), request.url),
        )
    } else if (!authorized && !isPublic(targetPage)) {
        customResponse = NextResponse.redirect(
            new URL(localizedPath(currentLocale, "/login"), request.url),
        )
    }

    if (customResponse) {
        if (tokens) {
            customResponse.cookies.set(accessTokenCookie(tokens.accessToken))
            customResponse.cookies.set(refreshTokenCookie(tokens.refreshToken))
        }
        return customResponse
    }

    const intlResponse = intlMiddleware(
        new NextRequest(request, { headers: pathnameHeaders(request) }),
    )

    if (tokens) {
        intlResponse.cookies.set(accessTokenCookie(tokens.accessToken))
        intlResponse.cookies.set(refreshTokenCookie(tokens.refreshToken))
    }

    return intlResponse
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
