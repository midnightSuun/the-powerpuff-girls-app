export const userSortFields = [
    "first_name",
    "last_name",
    "email",
    "department",
    "position",
] as const

export type UserSortField = (typeof userSortFields)[number]
