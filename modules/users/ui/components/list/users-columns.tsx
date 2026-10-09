import { ChevronRight } from "lucide-react"

import { type TableColumn } from "@/components/table"
import { type GetUsersQuery } from "@/gql"
import { type UserSortField } from "@/lib/user-sort"

import { UserAvatar } from "../../user-avatar"
import { UserRowMenu } from "./user-row-menu"

type User = GetUsersQuery["users"]["items"][number]

type ColumnTranslator = (key: string, values?: Record<string, string>) => string

const sortableColumn = (
    id: string,
    label: string,
    sortKey: UserSortField,
    sortLabel: string,
    render: TableColumn<User>["render"],
    className?: string,
): TableColumn<User> => ({
    id,
    label,
    className,
    sortKey,
    sortLabel,
    render,
})

export function getUsersColumns(
    t: ColumnTranslator,
    isAdmin: boolean,
): TableColumn<User>[] {
    const sortLabel = (column: string) => t("sortBy", { column })

    return [
        {
            id: "avatar",
            label: "",
            render: (user) => (
                <UserAvatar
                    src={user.profile.avatar}
                    firstName={user.profile.first_name}
                    lastName={user.profile.last_name}
                    email={user.email}
                />
            ),
        },
        sortableColumn(
            "firstName",
            t("firstName"),
            "first_name",
            sortLabel(t("firstName")),
            (user) => user.profile.first_name,
        ),
        sortableColumn(
            "lastName",
            t("lastName"),
            "last_name",
            sortLabel(t("lastName")),
            (user) => user.profile.last_name,
        ),
        sortableColumn(
            "email",
            t("email"),
            "email",
            sortLabel(t("email")),
            (user) => user.email,
            "hidden lg:table-cell",
        ),
        sortableColumn(
            "department",
            t("department"),
            "department",
            sortLabel(t("department")),
            (user) => user.department?.name,
        ),
        sortableColumn(
            "position",
            t("position"),
            "position",
            sortLabel(t("position")),
            (user) => user.position?.name,
            "hidden lg:table-cell",
        ),
        {
            id: "open",
            label: "",
            render: (user) =>
                isAdmin ? (
                    <UserRowMenu label={t("openMenu")} user={user} />
                ) : (
                    <ChevronRight className="size-4 text-muted-foreground" />
                ),
        },
    ]
}
