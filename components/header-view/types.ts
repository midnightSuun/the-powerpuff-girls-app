export type HeaderCopyKey =
    | "users"
    | "skills"
    | "languages"
    | "settings"
    | "departments"
    | "positions"
    | "projects"
    | "profile"
    | "cvs"
    | "cvDetails"
    | "cvSkills"
    | "cvProjects"
    | "cvPreview"

export type HeaderCopy = Record<HeaderCopyKey, string>

export type HeaderTab = {
    label: HeaderCopyKey
    path: string
    requiresUserAdminOrOwner?: boolean
}

export type HeaderDefaultPage = {
    type: "default"
    path: string
    title: HeaderCopyKey
    showSearch?: boolean
}

export type HeaderTabsPage = {
    type: "tabs"
    path: string
    firstBreadcrumb: HeaderCopyKey
    breadcrumbParam: string
    showBreadcrumbIcon: boolean
    preserveBreadcrumbCase?: boolean
    tabs: HeaderTab[]
}

export type HeaderPage = HeaderDefaultPage | HeaderTabsPage

export type PathMatch = {
    params: Record<string, string>
    remainder: string
}

export type BreadcrumbResult = {
    pagePath: string
    id: string
    value: string | null
}
