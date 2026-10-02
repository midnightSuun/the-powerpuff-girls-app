"use client"

import debounce from "debounce"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChangeEvent, useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { usePathname, useRouter } from "@/i18n/navigation"
import { buildListSearchParams } from "@/lib/list-search-params"
import { type SortOrder } from "@/lib/user-sort"

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

export function SearchInput() {
    const t = useTranslations("Common")
    const path = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const search = searchParams.get("search") ?? ""
    const limitParam = Number(searchParams.get("limit"))
    const limit =
        Number.isInteger(limitParam) && limitParam > 0
            ? limitParam
            : DEFAULT_LIMIT
    const sortBy = searchParams.get("sortBy") ?? ""
    const sortOrderParam = searchParams.get("sortOrder")
    const sortOrder: SortOrder = sortOrderParam === "desc" ? "desc" : "asc"
    const [value, setValue] = useState(search)
    const [prevSearch, setPrevSearch] = useState(search)
    const latestRef = useRef({ limit, path, router, sortBy, sortOrder })
    const updateSearchRef = useRef<(nextSearch: string) => void>(() => {})

    if (search !== prevSearch) {
        setPrevSearch(search)

        if (value === prevSearch) setValue(search)
    }

    useEffect(() => {
        latestRef.current = { limit, path, router, sortBy, sortOrder }
    }, [limit, path, router, sortBy, sortOrder])

    useEffect(() => {
        const updateSearch = debounce((nextSearch: string) => {
            const current = latestRef.current
            const params = buildListSearchParams({
                page: 1,
                limit: current.limit,
                search: nextSearch,
                sortBy: current.sortBy || undefined,
                sortOrder: current.sortOrder,
            })

            current.router.replace(`${current.path}?${params}`)
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
                className="h-10 w-full rounded-full border border-[#aeaeae] bg-transparent pr-3 pl-[46px] text-base tracking-[0.15px] text-[#2e2e2e] shadow-none placeholder:text-[#c4c4c6] focus-visible:border-[#aeaeae] focus-visible:ring-0 md:text-base dark:bg-transparent dark:text-[#f5f5f7] dark:placeholder:text-[#626262]"
            />
        </label>
    )
}
