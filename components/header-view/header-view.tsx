"use client"

import { useEffect, useState } from "react"

import { usePathname } from "@/i18n/navigation"

import { DefaultPageHeader } from "./default-page-header"
import { PageWithTabsHeader } from "./page-with-tabs-header"
import { getVisibleTabs, normalizePathname, resolvePage } from "./resolve-page"
import type { BreadcrumbResult, HeaderCopy, HeaderPage } from "./types"

type Props = {
    pages: HeaderPage[]
    copy: HeaderCopy
    breadcrumbLabel: string
    initialBreadcrumb: BreadcrumbResult | null
    viewerId: string | null
    isAdmin: boolean
    loadSecondBreadcrumb: (
        pagePath: string,
        id: string,
    ) => Promise<string | null>
}

export const HeaderView = ({
    pages,
    copy,
    breadcrumbLabel,
    initialBreadcrumb,
    viewerId,
    isAdmin,
    loadSecondBreadcrumb,
}: Props) => {
    const pathname = normalizePathname(usePathname())
    const resolved = resolvePage(pages, pathname, viewerId, isAdmin)
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
        const visibleTabs = getVisibleTabs(
            resolved.page,
            resolved.match,
            viewerId,
            isAdmin,
        )

        return (
            <PageWithTabsHeader
                page={resolved.page}
                match={resolved.match}
                visibleTabs={visibleTabs}
                secondBreadcrumb={secondBreadcrumb}
                copy={copy}
                breadcrumbLabel={breadcrumbLabel}
            />
        )
    }

    return <DefaultPageHeader page={resolved.page} copy={copy} />
}
