"use client"

import { useEffect, useState } from "react"

import { usePathname } from "@/i18n/navigation"

import { useBreadcrumbRefresh } from "./breadcrumb-refresh"
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
    const { revision: breadcrumbRevision, snapshot: breadcrumbSnapshot } =
        useBreadcrumbRefresh()
    const [loadedBreadcrumb, setLoadedBreadcrumb] = useState<
        (BreadcrumbResult & { revision: number }) | null
    >(initialBreadcrumb ? { ...initialBreadcrumb, revision: 0 } : null)
    const savedBreadcrumb =
        loadedBreadcrumb?.pagePath === pagePath &&
        loadedBreadcrumb.id === breadcrumbId
            ? loadedBreadcrumb.value
            : initialBreadcrumb?.pagePath === pagePath &&
                initialBreadcrumb.id === breadcrumbId
              ? initialBreadcrumb.value
              : null
    const secondBreadcrumb =
        loadedBreadcrumb?.pagePath === pagePath &&
        loadedBreadcrumb.id === breadcrumbId &&
        loadedBreadcrumb.revision === breadcrumbRevision
            ? loadedBreadcrumb.value
            : breadcrumbSnapshot?.pagePath === pagePath &&
                breadcrumbSnapshot.id === breadcrumbId
              ? breadcrumbSnapshot.value
              : savedBreadcrumb

    useEffect(() => {
        if (
            !breadcrumbId ||
            (loadedBreadcrumb?.pagePath === pagePath &&
                loadedBreadcrumb.id === breadcrumbId &&
                loadedBreadcrumb.revision === breadcrumbRevision)
        ) {
            return
        }

        let isCurrent = true

        loadSecondBreadcrumb(pagePath, breadcrumbId)
            .then((value) => {
                if (!isCurrent) return

                setLoadedBreadcrumb({
                    pagePath,
                    id: breadcrumbId,
                    value,
                    revision: breadcrumbRevision,
                })
            })
            .catch(() => {
                if (!isCurrent) return

                setLoadedBreadcrumb({
                    pagePath,
                    id: breadcrumbId,
                    value: null,
                    revision: breadcrumbRevision,
                })
            })

        return () => {
            isCurrent = false
        }
    }, [
        breadcrumbId,
        breadcrumbRevision,
        loadSecondBreadcrumb,
        loadedBreadcrumb?.id,
        loadedBreadcrumb?.pagePath,
        loadedBreadcrumb?.revision,
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
