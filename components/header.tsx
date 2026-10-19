import { ReactNode } from "react"

import type { HeaderCopyKey, HeaderPage } from "@/components/header-view"
import { HeaderView } from "@/components/header-view"
import { getHeaderCopy } from "@/components/header-view/get-header-copy"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getCvById } from "@/modules/cvs/api/get-cv"
import { getUser } from "@/modules/users/api/get-user"

type DefaultPage = {
    path: string
    title: HeaderCopyKey
    showSearch?: boolean
    showSearchForAdmin?: boolean
}

type PageWithTabs = {
    path: string
    firstBreadcrumb: HeaderCopyKey
    breadcrumbParam: string
    showBreadcrumbIcon: boolean
    preserveBreadcrumbCase?: boolean
    getSecondBreadcrumb: (id: string) => Promise<ReactNode>
    tabs: {
        label: HeaderCopyKey
        path: string
        requiresUserAdminOrOwner?: boolean
        showSearch?: boolean
    }[]
}

const PAGES: (DefaultPage | PageWithTabs)[] = [
    {
        path: "/users",
        title: "users",
        showSearch: true,
    },
    {
        path: "/cv",
        title: "cvs",
        showSearch: true,
    },
    {
        path: "/skills",
        title: "skills",
        showSearchForAdmin: true,
    },
    {
        path: "/languages",
        title: "languages",
        showSearchForAdmin: true,
    },
    {
        path: "/settings",
        title: "settings",
    },
    {
        path: "/departments",
        title: "departments",
        showSearch: true,
    },
    {
        path: "/positions",
        title: "positions",
        showSearch: true,
    },
    {
        path: "/projects",
        title: "projects",
        showSearch: true,
    },
    {
        path: "/users/{userId}",
        firstBreadcrumb: "users",
        breadcrumbParam: "userId",
        showBreadcrumbIcon: true,
        preserveBreadcrumbCase: true,
        getSecondBreadcrumb: async (id: string) => {
            const user = await getUser(id)
            const firstName = user.profile.first_name?.trim() ?? ""
            const lastName = user.profile.last_name?.trim() ?? ""

            if (firstName && lastName) {
                return `${firstName} ${lastName}`
            }

            return user.email
        },
        tabs: [
            { label: "profile", path: "/profile" },
            { label: "skills", path: "/skills", showSearch: false },
            { label: "languages", path: "/languages", showSearch: false },
            {
                label: "cvs",
                path: "/cv",
                requiresUserAdminOrOwner: true,
                showSearch: true,
            },
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

const toClientPages = (isAdmin: boolean): HeaderPage[] =>
    PAGES.map((page) => {
        if (isPageWithTabs(page)) {
            return {
                type: "tabs",
                path: page.path,
                firstBreadcrumb: page.firstBreadcrumb,
                breadcrumbParam: page.breadcrumbParam,
                showBreadcrumbIcon: page.showBreadcrumbIcon,
                preserveBreadcrumbCase: page.preserveBreadcrumbCase,
                tabs: page.tabs,
            }
        }

        return {
            type: "default",
            path: page.path,
            title: page.title,
            showSearch: page.showSearchForAdmin ? isAdmin : page.showSearch,
        }
    })

export const Header = async () => {
    const session = await getCurrentSession()
    const isAdmin = session?.role === "Admin"
    const { copy, breadcrumbLabel } = await getHeaderCopy()

    return (
        <HeaderView
            pages={toClientPages(isAdmin)}
            copy={copy}
            breadcrumbLabel={breadcrumbLabel}
            initialBreadcrumb={null}
            viewerId={session?.userId ?? null}
            isAdmin={isAdmin}
            loadSecondBreadcrumb={loadSecondBreadcrumb}
        />
    )
}
