import { DEFAULT_SORT_ORDER, type SortOrder } from "@/lib/sort"

export const cvSortFields = ["name"] as const

export type CvSortField = (typeof cvSortFields)[number]

export const defaultCvSortField: CvSortField = "name"

const readParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

export const parseCvSort = (params: {
    sortBy?: string | string[]
    sortOrder?: string | string[]
}): { sortBy?: CvSortField; sortOrder: SortOrder } => {
    const sortBy = readParam(params.sortBy)

    return {
        sortBy: cvSortFields.find((field) => field === sortBy),
        sortOrder:
            readParam(params.sortOrder) === "desc"
                ? "desc"
                : DEFAULT_SORT_ORDER,
    }
}
