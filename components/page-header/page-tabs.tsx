"use client"

import { cn } from "cn"

import { Link, usePathname } from "@/i18n/navigation"

export type PageTab = {
    label: string
    href: string
}

type Props = {
    tabs: PageTab[]
}

export const PageTabs = ({ tabs }: Props) => {
    const pathname = usePathname()
    const activeHref = tabs
        .filter(
            (tab) =>
                pathname === tab.href || pathname.startsWith(`${tab.href}/`),
        )
        .sort((left, right) => right.href.length - left.href.length)[0]?.href

    return (
        <div className="flex flex-wrap items-end gap-8">
            {tabs.map((tab) => {
                const isActive = tab.href === activeHref

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "border-b-2 pb-1.5 text-sm font-medium tracking-wide uppercase transition-colors",
                            isActive
                                ? "border-button-primary-default text-button-primary-default"
                                : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {tab.label}
                    </Link>
                )
            })}
        </div>
    )
}
