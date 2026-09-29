import { z } from "zod"

const numberParam = (fallback: number) =>
    z.coerce.number().min(1).optional().catch(fallback).default(fallback)

const stringParam = (fallback = "") =>
    z.string().optional().catch(fallback).default(fallback)

export const paginationSearchParamsSchema = z.object({
    limit: numberParam(10),
    page: numberParam(1),
    search: stringParam(),
})

export type PaginationSearchParams = z.infer<
    typeof paginationSearchParamsSchema
>

type RawSearchParams = Record<string, string | string[] | undefined>

export const parsePaginationSearchParams = (params: RawSearchParams) =>
    paginationSearchParamsSchema.parse(params)
