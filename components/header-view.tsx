"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { ReactNode, Suspense, useEffect, useState } from "react"

import { SearchInput } from "@/components/search-input"
import { Link, usePathname } from "@/i18n/navigation"

type HeaderTab = {
    label: string
    path: string
}

type HeaderDefaultPage = {
    type: "default"
    path: string
    title: string
    showSearch?: boolean
    actions?: ReactNode
}

type HeaderTabsPage = {
    type: "tabs"
    path: string
    firstBreadcrumb: string
    tabs: HeaderTab[]
}

export type HeaderPage = HeaderDefaultPage | HeaderTabsPage

type PathMatch = {
    params: Record<string, string>
    remainder: string
}

type BreadcrumbResult = {
    userId: string
    value: string | null
}

type Props = {
    pages: HeaderPage[]
    initialBreadcrumb: BreadcrumbResult | null
    loadSecondBreadcrumb: (id: string) => Promise<string | null>
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

const DefaultPageHeader = ({ page }: { page: HeaderDefaultPage }) => {
    const showToolbar = Boolean(page.showSearch || page.actions)

    return (
        <header className="w-full shrink-0 bg-[#f5f5f7] dark:bg-[#2e2e2e]">
            <div className="flex h-14 items-center px-5">
                <p className={crumbClassName}>{page.title}</p>
            </div>
            {showToolbar ? (
                <div className="flex h-14 items-center px-5">
                    {page.showSearch ? (
                        <Suspense fallback={<div className="h-10 w-80" />}>
                            <SearchInput />
                        </Suspense>
                    ) : null}
                    {page.actions ? (
                        <div className="ml-auto">{page.actions}</div>
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
}: {
    page: HeaderTabsPage
    match: PathMatch
    secondBreadcrumb: string | null
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
                            {page.firstBreadcrumb}
                        </Link>
                    </li>
                    <li aria-hidden className="flex items-center">
                        <ChevronIcon />
                    </li>
                    <li className="flex min-w-0 items-center">
                        <Link
                            href={basePath}
                            className="inline-flex min-w-0 items-center gap-2 text-base leading-6 font-normal tracking-[0.15px] text-[#c63031] capitalize"
                        >
                            <UserIcon />
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
                                    {activeTab.label}
                                </span>
                            </li>
                        </>
                    ) : null}
                </ol>
            </nav>
            <div className="flex h-14 items-end">
                {page.tabs.map((tab) => {
                    const isActive = tab.path === activeTab?.path

                    return (
                        <Link
                            key={tab.path}
                            href={joinPaths(basePath, tab.path)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex h-[50px] w-[150px] flex-col text-sm leading-[17.5px] tracking-[0.4px] uppercase",
                                isActive
                                    ? "font-semibold text-[#c63031]"
                                    : "font-medium text-[#2e2e2e] dark:text-[#f5f5f7]",
                            )}
                        >
                            <span className="flex h-12 w-full items-center justify-center">
                                {tab.label}
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
    const pathname = usePathname()
    const resolved = resolvePage(pages, pathname)
    const userId =
        resolved?.page.type === "tabs"
            ? (resolved.match.params.userId ??
              Object.values(resolved.match.params)[0] ??
              "")
            : ""
    const [loadedBreadcrumb, setLoadedBreadcrumb] =
        useState<BreadcrumbResult | null>(initialBreadcrumb)
    const secondBreadcrumb =
        loadedBreadcrumb?.userId === userId
            ? loadedBreadcrumb.value
            : initialBreadcrumb?.userId === userId
              ? initialBreadcrumb.value
              : null

    useEffect(() => {
        if (!userId || loadedBreadcrumb?.userId === userId) return

        let isCurrent = true

        loadSecondBreadcrumb(userId)
            .then((value) => {
                if (!isCurrent) return

                setLoadedBreadcrumb({ userId, value })
            })
            .catch(() => {
                if (!isCurrent) return

                setLoadedBreadcrumb({ userId, value: null })
            })

        return () => {
            isCurrent = false
        }
    }, [loadSecondBreadcrumb, loadedBreadcrumb?.userId, userId])

    if (!resolved) return null

    if (resolved.page.type === "tabs") {
        return (
            <PageWithTabsHeader
                page={resolved.page}
                match={resolved.match}
                secondBreadcrumb={secondBreadcrumb}
            />
        )
    }

    return <DefaultPageHeader page={resolved.page} />
}
