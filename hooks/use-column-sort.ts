"use client"

import { useCallback, useState } from "react"

import { DEFAULT_SORT_ORDER, nextSortOrder, type SortOrder } from "@/lib/sort"

type ColumnSortState<T extends string> = {
    sortBy: T
    sortOrder: SortOrder
}

export const useColumnSort = <T extends string>(
    defaultSortBy: T,
    defaultSortOrder: SortOrder = DEFAULT_SORT_ORDER,
) => {
    const [sort, setSort] = useState<ColumnSortState<T>>({
        sortBy: defaultSortBy,
        sortOrder: defaultSortOrder,
    })

    const toggleSort = useCallback((sortKey: T) => {
        setSort((current) => ({
            sortBy: sortKey,
            sortOrder: nextSortOrder(
                current.sortBy,
                current.sortOrder,
                sortKey,
            ),
        }))
    }, [])

    return {
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        toggleSort,
    }
}
