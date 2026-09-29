import { ChevronRight } from "lucide-react"
import { Suspense } from "react"

import { PageHeader } from "@/components/page-header"
import { PaginationComponent } from "@/components/pagination"
import { SearchInput } from "@/components/search-input"
import { type TableColumn, TableComponent } from "@/components/table"
import { type GetUsersQuery } from "@/gql"
import { type PaginationSearchParams } from "@/lib/pagination-search-params"

import { getUsers } from "../api/get-users"
import { UserAvatar } from "./user-avatar"

type User = GetUsersQuery["users"]["items"][number]

const columns: TableColumn<User>[] = [
    {
        label: "Avatar",
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
        label: "First Name",
        render: (user) => user.profile.first_name,
    },
    {
        label: "Last Name",
        render: (user) => user.profile.last_name,
    },
    {
        label: "Email",
        render: (user) => user.email,
    },
    {
        label: "Department",
        render: (user) => user.department?.name,
    },
    {
        label: "Position",
        render: (user) => user.position?.name,
    },
    {
        label: "",
        render: () => <ChevronRight className="size-4 text-muted-foreground" />,
    },
]

type Props = PaginationSearchParams

async function UsersListAsync({ limit, page, search }: Props) {
    const { users, totalPages } = await getUsers(limit, page, search)

    return (
        <>
            <TableComponent
                data={users}
                columns={columns}
                getRowHref={(user) => `/users/${user.id}`}
            />
            <PaginationComponent
                totalPages={totalPages}
                page={page}
                limit={limit}
                search={search}
                path="users"
            />
        </>
    )
}

export async function UsersPage({ limit, page, search }: Props) {
    return (
        <div>
            <PageHeader title="Employees">
                <SearchInput limit={limit} search={search} />
            </PageHeader>
            <Suspense
                key={page}
                fallback={<p className="p-4">Loading users...</p>}
            >
                <UsersListAsync limit={limit} page={page} search={search} />
            </Suspense>
        </div>
    )
}
