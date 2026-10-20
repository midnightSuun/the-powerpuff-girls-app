import { type GetUsersQuery } from "@/gql"

export type User = GetUsersQuery["users"]["items"][number]
