import Link from "next/link"
import { Suspense } from "react"

import { PageHeader } from "@/components/page-header"
import { PaginationComponent } from "@/components/pagination"
import { SearchInput } from "@/components/search-input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { type PaginationSearchParams } from "@/lib/pagination-search-params"

import { getUsers } from "../api/get-users"
import { UserAvatar } from "./user-avatar"

type Props = PaginationSearchParams

async function UsersListAsync({ limit, page, search }: Props) {
    const { users, totalPages } = await getUsers(limit, page, search)

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <span className="sr-only">Avatar</span>
                        </TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow
                            key={user.id}
                            className="relative cursor-pointer"
                        >
                            <TableCell className="w-12">
                                <UserAvatar
                                    src={user.profile.avatar}
                                    firstName={user.profile.first_name}
                                    lastName={user.profile.last_name}
                                />
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={`/users/${user.id}`}
                                    aria-label={`View ${user.profile.last_name}`}
                                    className="after:absolute after:inset-0 after:content-['']"
                                >
                                    {user.profile.first_name ?? "—"}
                                </Link>
                            </TableCell>
                            <TableCell>{user.profile.last_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.department?.name}</TableCell>
                            <TableCell>{user.position?.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
