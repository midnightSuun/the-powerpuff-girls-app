import {
    TableSkeleton,
    type TableSkeletonColumn,
} from "@/components/table-skeleton"

const columns: TableSkeletonColumn[] = [
    { id: "avatar", cellClassName: "size-8 rounded-full" },
    {
        id: "firstName",
        headerClassName: "h-3 w-16",
        cellClassName: "h-4 w-24",
    },
    {
        id: "lastName",
        headerClassName: "h-3 w-20",
        cellClassName: "h-4 w-28",
    },
    {
        id: "email",
        className: "hidden lg:table-cell",
        headerClassName: "h-3 w-12",
        cellClassName: "h-4 w-40",
    },
    {
        id: "department",
        headerClassName: "h-3 w-20",
        cellClassName: "h-4 w-28",
    },
    {
        id: "position",
        className: "hidden lg:table-cell",
        headerClassName: "h-3 w-16",
        cellClassName: "h-4 w-24",
    },
    { id: "open", cellClassName: "size-4 rounded-full" },
]

export const UsersTableSkeleton = () => {
    return <TableSkeleton columns={columns} />
}
