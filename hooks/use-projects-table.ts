import { useMemo, useState } from "react"

import { useColumnSort } from "@/hooks/use-column-sort"
import { sortByLocale } from "@/lib/sort"

export type SortField = "name" | "start_date" | "end_date"

interface UseProjectsTableProps<T> {
    items: T[]
    locale: string
    search: string
}

export function useProjectsTable<
    T extends {
        name: string
        domain: string
        description: string
        environment: string[]
        start_date?: string | null
        end_date?: string | null
    },
>({ items, locale, search }: UseProjectsTableProps<T>) {
    const {
        sortBy: sortField,
        sortOrder: sortDirection,
        toggleSort,
    } = useColumnSort<SortField>("name")
    const [itemToRemove, setItemToRemove] = useState<T | null>(null)

    const visibleItems = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase()

        const filtered = items.filter((item) =>
            [item.name, item.domain, item.description, ...item.environment]
                .join(" ")
                .toLocaleLowerCase()
                .includes(normalizedSearch),
        )

        return sortByLocale(
            filtered,
            (item) => item[sortField] ?? "",
            sortDirection,
            locale,
        )
    }, [items, locale, search, sortDirection, sortField])

    return {
        sortField,
        sortDirection,
        itemToRemove,
        setItemToRemove,
        visibleItems,
        toggleSort,
    }
}
