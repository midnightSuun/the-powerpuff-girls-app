"use client"

import debounce from "debounce"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChangeEvent, useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"

interface SearchInputProps {
    limit?: number
    search?: string
}

const SearchIcon = () => {
    return (
        <>
            <img
                alt=""
                src="/header/search-light.svg"
                width={24}
                height={24}
                className="dark:hidden"
            />
            <img
                alt=""
                src="/header/search-dark.svg"
                width={24}
                height={24}
                className="hidden dark:block"
            />
        </>
    )
}

const SEARCH_DEBOUNCE_MS = 500
const DEFAULT_LIMIT = 10

export function SearchInput({
    limit: propLimit,
    search: propSearch,
}: SearchInputProps) {
    const t = useTranslations("Common")
    const path = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()

    const querySearch = searchParams.get("search") ?? propSearch ?? ""
    const limitParam = Number(searchParams.get("limit"))
    const limit =
        Number.isInteger(limitParam) && limitParam > 0
            ? limitParam
            : (propLimit ?? DEFAULT_LIMIT)

    const [value, setValue] = useState(querySearch)
    const [prevSearch, setPrevSearch] = useState(querySearch)
    const latestRef = useRef({ limit, path, router })
    const updateSearchRef = useRef<(nextSearch: string) => void>(() => {})

    if (querySearch !== prevSearch) {
        setPrevSearch(querySearch)

        if (value === prevSearch) setValue(querySearch)
    }

    useEffect(() => {
        latestRef.current = { limit, path, router }
    }, [limit, path, router])

    useEffect(() => {
        const updateSearch = debounce((nextSearch: string) => {
            const current = latestRef.current
            const params = new URLSearchParams({
                page: "1",
                limit: String(current.limit),
                search: nextSearch,
            })

            current.router.replace(`${current.path}?${params.toString()}`)
        }, SEARCH_DEBOUNCE_MS)

        updateSearchRef.current = updateSearch

        return () => {
            updateSearch.clear()
        }
    }, [])

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value

        setValue(nextValue)
        updateSearchRef.current(nextValue)
    }

    return (
        <label className="relative block w-80 dark:drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
                <SearchIcon />
            </span>
            <Input
                type="text"
                value={value}
                onChange={handleSearch}
                placeholder={t("search")}
                className="h-9 w-full rounded-full border border-input bg-background pr-4 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
        </label>
    )
}
