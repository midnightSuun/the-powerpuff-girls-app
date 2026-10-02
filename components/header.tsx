import { headers } from "next/headers"
import { ReactNode } from "react"

import type { HeaderCopyKey, HeaderPage } from "@/components/header-view"
import { HeaderView } from "@/components/header-view"
import { routing } from "@/i18n/routing"
import { getUser } from "@/modules/users/api/get-user"

type DefaultPage = {
    path: string
    title: HeaderCopyKey
    showSearch?: boolean
    action?: "addEmployee"
}

type PageWithTabs = {
    path: string
    firstBreadcrumb: HeaderCopyKey
    getSecondBreadcrumb: (id: string) => Promise<ReactNode>
    tabs: {
        label: HeaderCopyKey
        path: string
    }[]
}

const PAGES: (DefaultPage | PageWithTabs)[] = [
    {
        path: "/users",
        title: "users",
        showSearch: true,
        action: "addEmployee",
    },
    {
        path: "/skills",
        title: "skills",
    },
    {
        path: "/languages",
        title: "languages",
    },
    {
        path: "/settings",
        title: "settings",
    },
    {
        path: "/users/{userId}",
        firstBreadcrumb: "users",
        getSecondBreadcrumb: async (id: string) => (await getUser(id)).email,
        tabs: [
            { label: "profile", path: "/profile" },
            { label: "skills", path: "/skills" },
            { label: "languages", path: "/languages" },
        ],
    },
]

const isPageWithTabs = (
    page: DefaultPage | PageWithTabs,
): page is PageWithTabs => "tabs" in page

const toText = (value: ReactNode) => {
    if (typeof value === "string" || typeof value === "number") {
        return String(value)
    }

    return null
}

const loadSecondBreadcrumb = async (id: string) => {
    "use server"

    const page = PAGES.find(isPageWithTabs)

    if (!page) return null

    try {
        return toText(await page.getSecondBreadcrumb(id))
    } catch {
        return null
    }
}

const stripLocale = (pathname: string) => {
    const segments = pathname.split("/")
    const locale = segments[1]

    if (routing.locales.includes(locale as (typeof routing.locales)[number])) {
        segments.splice(1, 1)
    }

    return segments.join("/") || "/"
}

const clientPages: HeaderPage[] = PAGES.map((page) => {
    if (isPageWithTabs(page)) {
        return {
            type: "tabs",
            path: page.path,
            firstBreadcrumb: page.firstBreadcrumb,
            tabs: page.tabs,
        }
    }

    return {
        type: "default",
        path: page.path,
        title: page.title,
        showSearch: page.showSearch,
        action: page.action,
    }
})

export const Header = async () => {
    const headerStore = await headers()
    const pathname = stripLocale(headerStore.get("x-pathname") ?? "/")
    const userId = pathname.split("/").filter(Boolean)[1]
    const tabsPage = PAGES.find(isPageWithTabs)
    const isUserPath = Boolean(
        userId && pathname.startsWith("/users/") && tabsPage,
    )
    let initialBreadcrumb: { userId: string; value: string | null } | null =
        null

    if (isUserPath && userId && tabsPage) {
        try {
            initialBreadcrumb = {
                userId,
                value: toText(await tabsPage.getSecondBreadcrumb(userId)),
            }
        } catch {
            initialBreadcrumb = { userId, value: null }
        }
    }

    return (
        <HeaderView
            pages={clientPages}
            initialBreadcrumb={initialBreadcrumb}
            loadSecondBreadcrumb={loadSecondBreadcrumb}
        />
    )
}
