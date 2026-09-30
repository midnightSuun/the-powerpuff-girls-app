import { ChevronRight } from "lucide-react"

import { type TableColumn } from "@/components/table"
import { type GetUsersQuery } from "@/gql"

import { UserAvatar } from "./user-avatar"

type User = GetUsersQuery["users"]["items"][number]

export function getUsersColumns(
    t: (key: string) => string,
): TableColumn<User>[] {
    return [
        {
            label: t("avatar"),
            render: (user) => (
                <UserAvatar
                    src={user.profile.avatar}
                    firstName={user.profile.first_name}
                    lastName={user.profile.last_name}
                    email={user.email}
                />
            ),
        },
        {
            label: t("firstName"),
            render: (user) => user.profile.first_name,
        },
        {
            label: t("lastName"),
            render: (user) => user.profile.last_name,
        },
        {
            label: t("email"),
            render: (user) => user.email,
        },
        {
            label: t("department"),
            render: (user) => user.department?.name,
        },
        {
            label: t("position"),
            render: (user) => user.position?.name,
        },
        {
            label: "",
            render: () => (
                <ChevronRight className="size-4 text-muted-foreground" />
            ),
        },
    ]
}
