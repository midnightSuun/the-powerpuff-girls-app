import { type JWTPayload, jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"

import { refreshTokens } from "@/modules/auth/api/refresh"
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
} from "@/modules/auth/consts"
import { isUserRole } from "@/modules/auth/helpers/is-user-role"

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

async function getJwtPayload(accessToken?: string): Promise<JWTPayload | null> {
    if (!accessToken) return null
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(accessToken, secret)
        return payload
    } catch {
        return null
    }
}

const refreshSession = async (request: NextRequest) => {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
    const payload = await getJwtPayload(accessToken)

    if (payload || !refreshToken) {
        return { tokens: null, payload }
    }

    try {
        const tokens = await refreshTokens(refreshToken)
        request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken)
        request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken)
        return {
            tokens,
            payload: await getJwtPayload(tokens.accessToken),
        }
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

const employeeRoutes = ["/languages", "/skills", "/profile", "/settings"]
const adminRoutes = ["/departments", "/positions", "/projects"]

function isPublic(route: string) {
    return publicRoutes.includes(route)
}

function isGuestOnly(route: string) {
    return guestOnlyRoutes.includes(route)
}

function isAdminRoute(route: string) {
    return adminRoutes.some((r) => route.startsWith(r))
}

function isEmployeeRoute(route: string) {
    return employeeRoutes.some((r) => route.startsWith(r))
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

    const session = await refreshSession(request)

    if (session === "failed") {
        const response = isPublic(targetPage)
            ? nextWithPathname(request)
            : NextResponse.redirect(
                  new URL(localizedPath(currentLocale, "/login"), request.url),
              )

        return clearTokens(response)
    }

    const tokens = session.tokens
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
    } else if (authorized) {
        const payload = session.payload
        const userRole = payload?.role

        if (!isUserRole(userRole)) {
            return clearTokens(
                NextResponse.redirect(
                    new URL(
                        localizedPath(currentLocale, "/login"),
                        request.url,
                    ),
                ),
            )
        }

        if (isAdminRoute(targetPage) && userRole !== "Admin") {
            customResponse = NextResponse.redirect(
                new URL(localizedPath(currentLocale, "/"), request.url),
            )
        } else if (
            isEmployeeRoute(targetPage) &&
            userRole !== "Admin" &&
            userRole !== "Employee"
        ) {
            customResponse = NextResponse.redirect(
                new URL(localizedPath(currentLocale, "/"), request.url),
            )
        }
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
