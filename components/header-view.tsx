"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { Suspense, useEffect, useState } from "react"

import { SearchInput } from "@/components/search-input"
import { Link, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { CreateUserDialog } from "@/modules/users/ui/create-user-dialog"

export type HeaderCopyKey =
    | "users"
    | "skills"
    | "languages"
    | "settings"
    | "profile"
    | "createUser"
    | "cvs"
    | "cvDetails"
    | "cvSkills"
    | "cvProjects"
    | "cvPreview"

type HeaderCopy = Record<HeaderCopyKey, string>

type HeaderTab = {
    label: HeaderCopyKey
    path: string
}

type HeaderDefaultPage = {
    type: "default"
    path: string
    title: HeaderCopyKey
    showSearch?: boolean
    action?: "createUser"
}

type HeaderTabsPage = {
    type: "tabs"
    path: string
    firstBreadcrumb: HeaderCopyKey
    breadcrumbParam: string
    showBreadcrumbIcon: boolean
    tabs: HeaderTab[]
}

export type HeaderPage = HeaderDefaultPage | HeaderTabsPage

type PathMatch = {
    params: Record<string, string>
    remainder: string
}

type BreadcrumbResult = {
    pagePath: string
    id: string
    value: string | null
}

type Props = {
    pages: HeaderPage[]
    initialBreadcrumb: BreadcrumbResult | null
    loadSecondBreadcrumb: (
        pagePath: string,
        id: string,
    ) => Promise<string | null>
}

const crumbClassName =
    "text-base leading-6 font-normal tracking-[0.15px] capitalize text-[#626262] dark:text-[#aeaeae]"

const matchTemplate = (
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

const fillPath = (template: string, params: Record<string, string>) =>
    template.replace(/\{([^}]+)\}/g, (_, key: string) =>
        encodeURIComponent(params[key] ?? ""),
    )

const parentPath = (template: string) => {
    const segments = template
        .split("/")
        .filter((segment) => segment && !/^\{.+\}$/.test(segment))

    return `/${segments.join("/")}` || "/"
}

const joinPaths = (base: string, tabPath: string) => {
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base
    const normalizedTab = tabPath.startsWith("/") ? tabPath : `/${tabPath}`

    return `${normalizedBase}${normalizedTab}`
}

const normalizePathname = (pathname: string) => {
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

const resolvePage = (pages: HeaderPage[], pathname: string) => {
    const matches = pages.flatMap((page) => {
        const match = matchTemplate(page.path, pathname)

        if (!match) return []

        if (page.type === "tabs") {
            const hasMatchingTab =
                match.remainder === "" ||
                page.tabs.some((tab) => tab.path === match.remainder)

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

const useHeaderCopy = (): HeaderCopy => {
    const tUsers = useTranslations("Users")
    const tSkills = useTranslations("Skills")
    const tLanguages = useTranslations("Languages")
    const tSettings = useTranslations("Settings")
    const tNav = useTranslations("User.nav")
    const tCvs = useTranslations("Cvs")
    const tCv = useTranslations("CV")

    return {
        users: tUsers("title"),
        skills: tSkills("title"),
        languages: tLanguages("title"),
        settings: tSettings("title"),
        profile: tNav("profile"),
        createUser: tUsers("createUser"),
        cvs: tCvs("title"),
        cvDetails: tCv("tabs.details").toLowerCase(),
        cvSkills: tCv("tabs.skills").toLowerCase(),
        cvProjects: tCv("tabs.projects").toLowerCase(),
        cvPreview: tCv("tabs.preview").toLowerCase(),
    }
}

const ChevronIcon = () => {
    return (
        <img
            alt=""
            src="/header/chevron.svg"
            width={20}
            height={20}
            className="shrink-0"
        />
    )
}

const UserIcon = () => {
    return (
        <img
            alt=""
            src="/header/user.svg"
            width={24}
            height={24}
            className="shrink-0"
        />
    )
}

const DefaultPageHeader = ({
    page,
    copy,
}: {
    page: HeaderDefaultPage
    copy: HeaderCopy
}) => {
    const showToolbar = Boolean(page.showSearch || page.action)

    return (
        <header className="w-full shrink-0 bg-[#f5f5f7] dark:bg-[#2e2e2e]">
            <div className="flex h-14 items-center px-5">
                <p className={crumbClassName}>{copy[page.title]}</p>
            </div>
            {showToolbar ? (
                <div className="flex h-14 items-center px-5">
                    {page.showSearch ? (
                        <Suspense fallback={<div className="h-10 w-80" />}>
                            <SearchInput />
                        </Suspense>
                    ) : null}
                    {page.action === "createUser" ? (
                        <div className="ml-auto">
                            <CreateUserDialog label={copy.createUser} />
                        </div>
                    ) : null}
                </div>
            ) : null}
        </header>
    )
}

const PageWithTabsHeader = ({
    page,
    match,
    secondBreadcrumb,
    copy,
}: {
    page: HeaderTabsPage
    match: PathMatch
    secondBreadcrumb: string | null
    copy: HeaderCopy
}) => {
    const t = useTranslations("Common")
    const basePath = fillPath(page.path, match.params)
    const activeTab = page.tabs.find((tab) => tab.path === match.remainder)

    return (
        <header className="w-full shrink-0 bg-[#f5f5f7] dark:bg-[#2e2e2e]">
            <nav
                aria-label={t("breadcrumb")}
                className="flex h-14 items-center px-5"
            >
                <ol className="flex min-w-0 items-center gap-2">
                    <li className="flex items-center">
                        <Link
                            href={parentPath(page.path)}
                            className={crumbClassName}
                        >
                            {copy[page.firstBreadcrumb]}
                        </Link>
                    </li>
                    <li aria-hidden className="flex items-center">
                        <ChevronIcon />
                    </li>
                    <li className="flex min-w-0 items-center">
                        <Link
                            href={basePath}
                            className={cn(
                                "inline-flex min-w-0 items-center text-base leading-6 font-normal tracking-[0.15px] text-[#c63031] capitalize",
                                page.showBreadcrumbIcon && "gap-2",
                            )}
                        >
                            {page.showBreadcrumbIcon ? <UserIcon /> : null}
                            <span className="truncate">{secondBreadcrumb}</span>
                        </Link>
                    </li>
                    {activeTab ? (
                        <>
                            <li aria-hidden className="flex items-center">
                                <ChevronIcon />
                            </li>
                            <li className="flex items-center">
                                <span
                                    aria-current="page"
                                    className={crumbClassName}
                                >
                                    {copy[activeTab.label]}
                                </span>
                            </li>
                        </>
                    ) : null}
                </ol>
            </nav>
            <div className="flex h-14 items-end overflow-x-auto">
                {page.tabs.map((tab) => {
                    const isActive = tab.path === activeTab?.path

                    return (
                        <Link
                            key={tab.path}
                            href={joinPaths(basePath, tab.path)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex h-[50px] w-[150px] shrink-0 flex-col text-sm leading-[17.5px] tracking-[0.4px] uppercase",
                                isActive
                                    ? "font-semibold text-[#c63031]"
                                    : "font-medium text-[#2e2e2e] dark:text-[#f5f5f7]",
                            )}
                        >
                            <span className="flex h-12 w-full items-center justify-center">
                                {copy[tab.label]}
                            </span>
                            <span
                                className={cn(
                                    "h-0.5 w-full",
                                    isActive
                                        ? "bg-[#c63031]"
                                        : "bg-transparent",
                                )}
                            />
                        </Link>
                    )
                })}
            </div>
        </header>
    )
}

export const HeaderView = ({
    pages,
    initialBreadcrumb,
    loadSecondBreadcrumb,
}: Props) => {
    const copy = useHeaderCopy()
    const pathname = normalizePathname(usePathname())
    const resolved = resolvePage(pages, pathname)
    const breadcrumbId =
        resolved?.page.type === "tabs"
            ? (resolved.match.params[resolved.page.breadcrumbParam] ?? "")
            : ""
    const pagePath = resolved?.page.type === "tabs" ? resolved.page.path : ""
    const [loadedBreadcrumb, setLoadedBreadcrumb] =
        useState<BreadcrumbResult | null>(initialBreadcrumb)
    const secondBreadcrumb =
        loadedBreadcrumb?.pagePath === pagePath &&
        loadedBreadcrumb.id === breadcrumbId
            ? loadedBreadcrumb.value
            : initialBreadcrumb?.pagePath === pagePath &&
                initialBreadcrumb.id === breadcrumbId
              ? initialBreadcrumb.value
              : null

    useEffect(() => {
        if (
            !breadcrumbId ||
            (loadedBreadcrumb?.pagePath === pagePath &&
                loadedBreadcrumb.id === breadcrumbId)
        ) {
            return
        }

        let isCurrent = true

        loadSecondBreadcrumb(pagePath, breadcrumbId)
            .then((value) => {
                if (!isCurrent) return

                setLoadedBreadcrumb({ pagePath, id: breadcrumbId, value })
            })
            .catch(() => {
                if (!isCurrent) return

                setLoadedBreadcrumb({
                    pagePath,
                    id: breadcrumbId,
                    value: null,
                })
            })

        return () => {
            isCurrent = false
        }
    }, [
        breadcrumbId,
        loadSecondBreadcrumb,
        loadedBreadcrumb?.id,
        loadedBreadcrumb?.pagePath,
        pagePath,
    ])

    if (!resolved) return null

    if (resolved.page.type === "tabs") {
        return (
            <PageWithTabsHeader
                page={resolved.page}
                match={resolved.match}
                secondBreadcrumb={secondBreadcrumb}
                copy={copy}
            />
        )
    }

    return <DefaultPageHeader page={resolved.page} copy={copy} />
}
