import { cn } from "cn"

import { Link } from "@/i18n/navigation"

import { ChevronIcon, UserIcon } from "./icons"
import { fillPath, joinPaths, parentPath } from "./resolve-page"
import { crumbClassName } from "./styles"
import type { HeaderCopy, HeaderTab, HeaderTabsPage, PathMatch } from "./types"

type Props = {
    page: HeaderTabsPage
    match: PathMatch
    visibleTabs: HeaderTab[]
    secondBreadcrumb: string | null
    copy: HeaderCopy
    breadcrumbLabel: string
}

export const PageWithTabsHeader = ({
    page,
    match,
    visibleTabs,
    secondBreadcrumb,
    copy,
    breadcrumbLabel,
}: Props) => {
    const basePath = fillPath(page.path, match.params)
    const activeTab = visibleTabs.find((tab) => tab.path === match.remainder)

    return (
        <header className="w-full shrink-0 bg-[#f5f5f7] dark:bg-[#2e2e2e]">
            <nav
                aria-label={breadcrumbLabel}
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
                                "inline-flex min-w-0 items-center text-base leading-6 font-normal tracking-[0.15px] text-button-primary-default",
                                !page.preserveBreadcrumbCase && "capitalize",
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
                {visibleTabs.map((tab) => {
                    const isActive = tab.path === activeTab?.path

                    return (
                        <Link
                            key={tab.path}
                            href={joinPaths(basePath, tab.path)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex h-12.5 w-37.5 shrink-0 flex-col text-sm leading-[17.5px] tracking-[0.4px] uppercase",
                                isActive
                                    ? "font-semibold text-button-primary-default"
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
                                        ? "bg-button-primary-default"
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
