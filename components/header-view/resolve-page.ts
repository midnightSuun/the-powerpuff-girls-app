import { routing } from "@/i18n/routing"

import type { HeaderPage, HeaderTabsPage, PathMatch } from "./types"

export const matchTemplate = (
    template: string,
    pathname: string,
): PathMatch | null => {
    const templateSegments = template.split("/").filter(Boolean)
    const pathSegments = pathname.split("/").filter(Boolean)

    if (pathSegments.length < templateSegments.length) return null

    const params: Record<string, string> = {}

    for (let index = 0; index < templateSegments.length; index += 1) {
        const templateSegment = templateSegments[index]
        const pathSegment = pathSegments[index]
        const paramName = templateSegment.match(/^\{(.+)\}$/)?.[1]

        if (paramName) {
            try {
                params[paramName] = decodeURIComponent(pathSegment)
            } catch {
                params[paramName] = pathSegment
            }
            continue
        }

        if (templateSegment !== pathSegment) return null
    }

    const rest = pathSegments.slice(templateSegments.length)

    return {
        params,
        remainder: rest.length ? `/${rest.join("/")}` : "",
    }
}

export const fillPath = (template: string, params: Record<string, string>) =>
    template.replace(/\{([^}]+)\}/g, (_, key: string) =>
        encodeURIComponent(params[key] ?? ""),
    )

export const parentPath = (template: string) => {
    const segments = template
        .split("/")
        .filter((segment) => segment && !/^\{.+\}$/.test(segment))

    return `/${segments.join("/")}` || "/"
}

export const joinPaths = (base: string, tabPath: string) => {
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base
    const normalizedTab = tabPath.startsWith("/") ? tabPath : `/${tabPath}`

    return `${normalizedBase}${normalizedTab}`
}

export const normalizePathname = (pathname: string) => {
    const segments = pathname.split(/[?#]/, 1)[0].split("/").filter(Boolean)

    if (
        routing.locales.includes(
            segments[0] as (typeof routing.locales)[number],
        )
    ) {
        segments.shift()
    }

    return `/${segments.join("/")}`
}

export const getVisibleTabs = (
    page: HeaderTabsPage,
    match: PathMatch,
    viewerId: string | null,
    isAdmin: boolean,
) =>
    page.tabs.filter(
        (tab) =>
            !tab.requiresUserAdminOrOwner ||
            isAdmin ||
            viewerId === match.params.userId,
    )

export const resolvePage = (
    pages: HeaderPage[],
    pathname: string,
    viewerId: string | null,
    isAdmin: boolean,
) => {
    const matches = pages.flatMap((page) => {
        const match = matchTemplate(page.path, pathname)

        if (!match) return []

        if (page.type === "tabs") {
            const visibleTabs = getVisibleTabs(page, match, viewerId, isAdmin)
            const hasMatchingTab =
                match.remainder === "" ||
                visibleTabs.some((tab) => tab.path === match.remainder)

            if (!hasMatchingTab) return []
        } else if (match.remainder !== "") {
            return []
        }

        return [{ page, match }]
    })

    matches.sort((left, right) => {
        const leftScore = left.page.path.split("/").filter(Boolean).length
        const rightScore = right.page.path.split("/").filter(Boolean).length

        return rightScore - leftScore
    })

    return matches[0] ?? null
}
