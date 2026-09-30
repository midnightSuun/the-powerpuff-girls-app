import { getTranslations } from "next-intl/server"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

type PaginationComponentProps = {
    totalPages: number
    page: number
    limit: number
    search: string
    path: string
}

type PageItem = number | "ellipsis"

const SIBLING_COUNT = 1

const getPageItems = (totalPages: number, page: number): PageItem[] => {
    const items: PageItem[] = []
    let previousPageNumber = 0

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        const isEdge = pageNumber === 1 || pageNumber === totalPages
        const isNearCurrent = Math.abs(pageNumber - page) <= SIBLING_COUNT

        if (!isEdge && !isNearCurrent) {
            continue
        }

        if (previousPageNumber > 0 && pageNumber - previousPageNumber > 1) {
            items.push("ellipsis")
        }

        items.push(pageNumber)
        previousPageNumber = pageNumber
    }

    return items
}

export async function PaginationComponent({
    totalPages,
    page,
    limit,
    search,
    path,
}: PaginationComponentProps) {
    if (totalPages <= 1) {
        return null
    }

    const t = await getTranslations("Pagination")

    const hrefForPage = (pageNumber: number) =>
        `/${path}?page=${pageNumber}&limit=${limit}&search=${encodeURIComponent(search)}`

    const previousPage = Math.max(1, page - 1)
    const nextPage = Math.min(totalPages, page + 1)
    const pageItems = getPageItems(totalPages, page)

    return (
        <Pagination className="px-4 py-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={hrefForPage(previousPage)}
                        isDisabled={page <= 1}
                        text={t("previous")}
                    />
                </PaginationItem>
                {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={item}>
                            <PaginationLink
                                href={hrefForPage(item)}
                                isActive={item === page}
                            >
                                {item}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}
                <PaginationItem>
                    <PaginationNext
                        href={hrefForPage(nextPage)}
                        isDisabled={page >= totalPages}
                        text={t("next")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
