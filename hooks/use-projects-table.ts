import { useMemo, useState } from "react"

export type SortField = "name" | "start_date" | "end_date"

interface UseProjectsTableProps<T> {
    items: T[]
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
>({ items }: UseProjectsTableProps<T>) {
    const [search, setSearch] = useState("")
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [itemToRemove, setItemToRemove] = useState<T | null>(null)

    const visibleItems = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase()

        return items
            .filter((item) =>
                [item.name, item.domain, item.description, ...item.environment]
                    .join(" ")
                    .toLocaleLowerCase()
                    .includes(normalizedSearch),
            )
            .sort((left, right) => {
                const comparison = (left[sortField] ?? "").localeCompare(
                    right[sortField] ?? "",
                )
                return sortDirection === "asc" ? comparison : -comparison
            })
    }, [items, search, sortDirection, sortField])

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc",
            )
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    return {
        search,
        setSearch,
        sortField,
        sortDirection,
        itemToRemove,
        setItemToRemove,
        visibleItems,
        toggleSort,
    }
}
