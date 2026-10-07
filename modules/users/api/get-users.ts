import { cacheLife, cacheTag } from "next/cache"

import { getGql, GetUsersDocument } from "@/gql"
import {
    sortByLocale,
    type SortOrder,
    type UserSortField,
} from "@/lib/user-sort"
import { type User } from "@/types"

const FETCH_LIMIT = 100

const getSortValue = (user: User, sortBy: UserSortField) => {
    if (sortBy === "first_name") return user.profile.first_name ?? ""
    if (sortBy === "last_name") return user.profile.last_name ?? ""
    if (sortBy === "email") return user.email
    if (sortBy === "department") return user.department?.name ?? ""

    return user.position?.name ?? ""
}

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

    const gql = await getGql()

    if (!sortBy) {
        const data = await gql.request(GetUsersDocument, {
            params: { limit, page, search },
        })

        return {
            users: data.users.items,
            totalPages: data.users.total_pages,
        }
    }

    const firstPage = await gql.request(GetUsersDocument, {
        params: { limit: FETCH_LIMIT, page: 1, search },
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
                              search,
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
        (user) => getSortValue(user, sortBy),
        sortOrder,
        locale,
    )
    const start = (page - 1) * limit

    return {
        users: sorted.slice(start, start + limit),
        totalPages: sorted.length === 0 ? 0 : Math.ceil(sorted.length / limit),
    }
}
