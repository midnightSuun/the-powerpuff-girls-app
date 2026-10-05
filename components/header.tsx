import { ReactNode } from "react"

import type { HeaderCopyKey, HeaderPage } from "@/components/header-view"
import { HeaderView } from "@/components/header-view"
import { getCvById } from "@/modules/cvs/api/get-cv"
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
    breadcrumbParam: string
    showBreadcrumbIcon: boolean
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
        path: "/cv",
        title: "cvs",
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
        breadcrumbParam: "userId",
        showBreadcrumbIcon: true,
        getSecondBreadcrumb: async (id: string) => (await getUser(id)).email,
        tabs: [
            { label: "profile", path: "/profile" },
            { label: "skills", path: "/skills" },
            { label: "languages", path: "/languages" },
        ],
    },
    {
        path: "/cv/{id}",
        firstBreadcrumb: "cvs",
        breadcrumbParam: "id",
        showBreadcrumbIcon: false,
        getSecondBreadcrumb: async (id: string) =>
            (await getCvById(id)).data?.name ?? null,
        tabs: [
            { label: "cvDetails", path: "" },
            { label: "cvSkills", path: "/skills" },
            { label: "cvProjects", path: "/projects" },
            { label: "cvPreview", path: "/preview" },
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

const loadSecondBreadcrumb = async (pagePath: string, id: string) => {
    "use server"

    const page = PAGES.find(
        (candidate) => isPageWithTabs(candidate) && candidate.path === pagePath,
    )

    if (!page || !isPageWithTabs(page)) return null

    try {
        return toText(await page.getSecondBreadcrumb(id))
    } catch {
        return null
    }
}

const clientPages: HeaderPage[] = PAGES.map((page) => {
    if (isPageWithTabs(page)) {
        return {
            type: "tabs",
            path: page.path,
            firstBreadcrumb: page.firstBreadcrumb,
            breadcrumbParam: page.breadcrumbParam,
            showBreadcrumbIcon: page.showBreadcrumbIcon,
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

export const Header = () => {
    return (
        <HeaderView
            pages={clientPages}
            initialBreadcrumb={null}
            loadSecondBreadcrumb={loadSecondBreadcrumb}
        />
    )
}
