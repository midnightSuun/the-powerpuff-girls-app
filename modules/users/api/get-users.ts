import { cacheLife, cacheTag } from "next/cache"

import { getGql, GetUsersDocument } from "@/gql"
import { sortByLocale, type SortOrder } from "@/lib/sort"
import { type UserSortField } from "@/lib/user-sort"
import { type User } from "@/types"

const FETCH_LIMIT = 100

type RelationSortField = "department" | "position"

const isRelationSortField = (
    sortBy: UserSortField | undefined,
): sortBy is RelationSortField =>
    sortBy === "department" || sortBy === "position"

const getRelationSortValue = (user: User, sortBy: RelationSortField) =>
    sortBy === "department"
        ? (user.department?.name ?? "")
        : (user.position?.name ?? "")

export async function getUsers(
    limit: number,
    page: number,
    search: string,
    sortBy: UserSortField | undefined,
    sortOrder: SortOrder,
    locale: string,
) {
    "use cache: private"
    cacheLife("hours")
    cacheTag("users")

    const normalizedSearch = search.trim()
    const gql = await getGql()
    const searchParams = normalizedSearch ? { search: normalizedSearch } : {}

    if (!isRelationSortField(sortBy)) {
        const data = await gql.request(GetUsersDocument, {
            params: {
                limit,
                page,
                ...searchParams,
                sort_by: sortBy,
                sort_order: sortBy ? sortOrder : undefined,
            },
        })

        return {
            users: data.users.items,
            totalPages: data.users.total_pages,
        }
    }

    const firstPage = await gql.request(GetUsersDocument, {
        params: { limit: FETCH_LIMIT, page: 1, ...searchParams },
    })
    const pageCount = firstPage.users.total_pages
    const otherPages =
        pageCount > 1
            ? await Promise.all(
                  Array.from({ length: pageCount - 1 }, (_, index) =>
                      gql.request(GetUsersDocument, {
                          params: {
                              limit: FETCH_LIMIT,
                              page: index + 2,
                              ...searchParams,
                          },
                      }),
                  ),
              )
            : []
    const items = [firstPage, ...otherPages].flatMap(
        (result) => result.users.items,
    )
    const sorted = sortByLocale(
        items,
        (user) => getRelationSortValue(user, sortBy),
        sortOrder,
        locale,
    )
    const start = (page - 1) * limit

    return {
        users: sorted.slice(start, start + limit),
        totalPages: sorted.length === 0 ? 0 : Math.ceil(sorted.length / limit),
    }
}
