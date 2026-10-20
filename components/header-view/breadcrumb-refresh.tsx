"use client"

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react"

export type BreadcrumbSnapshot = {
    pagePath: string
    id: string
    value: string
}

type BreadcrumbRefreshState = {
    revision: number
    snapshot: BreadcrumbSnapshot | null
}

type BreadcrumbRefreshContextValue = BreadcrumbRefreshState & {
    refreshBreadcrumb: (snapshot: BreadcrumbSnapshot) => void
}

const BreadcrumbRefreshContext =
    createContext<BreadcrumbRefreshContextValue | null>(null)

const noop = () => {}

export const BreadcrumbRefreshProvider = ({
    children,
}: {
    children: ReactNode
}) => {
    const [state, setState] = useState<BreadcrumbRefreshState>({
        revision: 0,
        snapshot: null,
    })
    const refreshBreadcrumb = useCallback((snapshot: BreadcrumbSnapshot) => {
        setState((current) => ({
            revision: current.revision + 1,
            snapshot,
        }))
    }, [])
    const value = useMemo(
        () => ({ ...state, refreshBreadcrumb }),
        [refreshBreadcrumb, state],
    )

    return (
        <BreadcrumbRefreshContext.Provider value={value}>
            {children}
        </BreadcrumbRefreshContext.Provider>
    )
}

export const useBreadcrumbRefresh = () =>
    useContext(BreadcrumbRefreshContext) ?? {
        revision: 0,
        snapshot: null,
        refreshBreadcrumb: noop,
    }
