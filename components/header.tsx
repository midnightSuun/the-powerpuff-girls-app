import { headers } from "next/headers"
import { ReactNode } from "react"

import type { HeaderPage } from "@/components/header-view"
import { HeaderView } from "@/components/header-view"
import { Button } from "@/components/ui/button"
import { routing } from "@/i18n/routing"
import { getUser } from "@/modules/users/api/get-user"

type DefaultPage = {
    path: string
    title: string
    showSearch?: boolean
    actions?: ReactNode
}

type PageWithTabs = {
    path: string
    firstBreadcrumb: string
    getSecondBreadcrumb: (id: string) => Promise<ReactNode>
    tabs: {
        label: string
        path: string
    }[]
}

const PAGES: (DefaultPage | PageWithTabs)[] = [
    {
        path: "/users",
        title: "Employees",
        showSearch: true,
        actions: <Button>Add Employee</Button>,
    },
    {
        path: "/skills",
        title: "Skills",
    },
    {
        path: "/languages",
        title: "Languages",
    },
    {
        path: "/settings",
        title: "Settings",
    },
    {
        path: "/users/{userId}",
        firstBreadcrumb: "Employees",
        getSecondBreadcrumb: async (id: string) => (await getUser(id)).email,
        tabs: [
            { label: "Profile", path: "/profile" },
            { label: "Skills", path: "/skills" },
            { label: "Languages", path: "/languages" },
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
        actions: page.actions,
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
