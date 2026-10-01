"use client"

import debounce from "debounce"
import { Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { ChangeEvent, useEffect, useMemo, useState } from "react"

import { Input } from "@/components/ui/input"

type Props = {
    limit: number
    search: string
}

const SEARCH_DEBOUNCE_MS = 500

export function SearchInput({ limit, search }: Props) {
    const path = usePathname()
    const router = useRouter()
    const [value, setValue] = useState(search)
    const [prevSearch, setPrevSearch] = useState(search)

    if (search !== prevSearch) {
        setPrevSearch(search)

        if (value === prevSearch) setValue(search)
    }

    const updateSearch = useMemo(
        () =>
            debounce(
                (nextPath: string, nextLimit: number, nextSearch: string) => {
                    const params = new URLSearchParams({
                        page: "1",
                        limit: String(nextLimit),
                        search: nextSearch,
                    })

                    router.replace(`${nextPath}?${params.toString()}`)
                },
                SEARCH_DEBOUNCE_MS,
            ),
        [router],
    )

    useEffect(() => {
        return () => {
            updateSearch.clear()
        }
    }, [updateSearch])

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value

        setValue(nextValue)
        updateSearch(path, limit, nextValue)
    }

    return (
        <label className="relative block w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                value={value}
                onChange={handleSearch}
                placeholder="Search"
                className="h-9 w-full rounded-full border border-input bg-background pr-4 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
        </label>
    )
}
