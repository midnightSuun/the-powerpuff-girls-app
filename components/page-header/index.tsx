"use client"

import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Suspense } from "react"

import { SearchInput } from "@/components/search-input"
import { Link, usePathname } from "@/i18n/navigation"

import { PageTabs } from "./page-tabs"
import { UserEmail } from "./user-email"

type Section = {
    path: string
    title: string
    showSearch?: boolean
    hasUser?: boolean
    tabs?: {
        segment: string
        label: string
    }[]
}

const USER_TAB_SEGMENTS = ["profile", "skills", "languages"] as const

const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1)

export const PageHeader = () => {
    const pathname = usePathname()
    const tUsers = useTranslations("Users")
    const tSkills = useTranslations("Skills")
    const tLanguages = useTranslations("Languages")
    const tCvs = useTranslations("Cvs")
    const tSettings = useTranslations("Settings")
    const tNav = useTranslations("User.nav")
    const tCommon = useTranslations("Common")

    const userTabLabels = {
        profile: tNav("profile"),
        skills: tSkills("title"),
        languages: tLanguages("title"),
    }
    const userTabs = USER_TAB_SEGMENTS.map((segment) => ({
        segment,
        label: userTabLabels[segment],
    }))

    const sections: Section[] = [
        {
            path: "/users",
            title: tUsers("title"),
            showSearch: true,
            hasUser: true,
            tabs: userTabs,
        },
        { path: "/skills", title: tSkills("title") },
        { path: "/languages", title: tLanguages("title") },
        { path: "/cv", title: tCvs("title") },
        { path: "/settings", title: tSettings("title") },
        { path: "/profile", title: tNav("profile"), hasUser: true },
    ]

    const segments = pathname.split("/").filter(Boolean)
    const section = sections.find((item) => item.path === `/${segments[0]}`)

    if (!section) return null

    const second = segments[1]
    const third = segments[2]
    const secondIsTab = section.tabs?.some((tab) => tab.segment === second)
    const userId =
        section.hasUser && second && !secondIsTab ? second : undefined
    const tabSegment = userId ? third : secondIsTab ? second : undefined
    const tab = section.tabs?.find((item) => item.segment === tabSegment)
    const tabLabel = tab?.label ?? (tabSegment ? capitalize(tabSegment) : null)
    const tabs = section.tabs?.map((item) => ({
        label: item.label,
        href: userId
            ? `${section.path}/${userId}/${item.segment}`
            : `${section.path}/${item.segment}`,
    }))
    const showTabs = Boolean(tabs?.length && (!section.hasUser || userId))

    return (
        <header className="flex flex-col gap-3 px-4 pt-4 pb-3">
            {userId || tabLabel ? (
                <nav aria-label={tCommon("breadcrumb")}>
                    <ol className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <li className="flex min-w-0 items-center gap-2">
                            <Link
                                href={section.path}
                                className="inline-flex min-w-0 items-center rounded-sm transition-colors hover:text-foreground"
                            >
                                {section.title}
                            </Link>
                        </li>
                        {userId ? (
                            <li className="flex min-w-0 items-center gap-2">
                                <ChevronRight
                                    aria-hidden
                                    className="size-3.5 shrink-0"
                                />
                                {tabLabel ? (
                                    <Link
                                        href={`${section.path}/${userId}`}
                                        className="inline-flex min-w-0 items-center rounded-sm transition-colors hover:text-foreground"
                                    >
                                        <UserEmail userId={userId} />
                                    </Link>
                                ) : (
                                    <span
                                        aria-current="page"
                                        className="inline-flex min-w-0 items-center"
                                    >
                                        <UserEmail userId={userId} />
                                    </span>
                                )}
                            </li>
                        ) : null}
                        {tabLabel ? (
                            <li className="flex min-w-0 items-center gap-2">
                                <ChevronRight
                                    aria-hidden
                                    className="size-3.5 shrink-0"
                                />
                                <span aria-current="page">{tabLabel}</span>
                            </li>
                        ) : null}
                    </ol>
                </nav>
            ) : (
                <p className="text-sm text-muted-foreground">{section.title}</p>
            )}
            {section.showSearch && !userId ? (
                <Suspense fallback={<div className="h-9 w-72" />}>
                    <SearchInput />
                </Suspense>
            ) : null}
            {showTabs && tabs ? <PageTabs tabs={tabs} /> : null}
        </header>
    )
}
