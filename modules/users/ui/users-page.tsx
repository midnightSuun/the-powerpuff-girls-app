import Link from "next/link"
import { Suspense } from "react"

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

import { getUsers } from "../api/get-users"
import { UserAvatar } from "./user-avatar"

type Props = {
    limit: number
    page: number
    search: string
}

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
                                    className="after:absolute after:inset-0 after:content-['']"
                                >
                                    {user.profile.first_name}
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
            <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
                <p className="text-sm text-muted-foreground">Employees</p>
                <SearchInput limit={limit} search={search} />
            </div>
            <Suspense fallback={<p className="p-4">Loading users...</p>}>
                <UsersListAsync limit={limit} page={page} search={search} />
            </Suspense>
        </div>
    )
}
