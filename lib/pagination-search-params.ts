import { z } from "zod"

import { userSortFields } from "@/lib/user-sort"

const numberParam = (fallback: number) =>
    z.coerce.number().min(1).optional().catch(fallback).default(fallback)

const stringParam = (fallback = "") =>
    z.string().optional().catch(fallback).default(fallback)

export const paginationSearchParamsSchema = z.object({
    limit: numberParam(10),
    page: numberParam(1),
    search: stringParam(),
    sortBy: z.enum(userSortFields).optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch("asc").default("asc"),
})

export type PaginationSearchParams = z.infer<
    typeof paginationSearchParamsSchema
>

type RawSearchParams = Record<string, string | string[] | undefined>

export const parsePaginationSearchParams = (params: RawSearchParams) =>
    paginationSearchParamsSchema.parse(params)
