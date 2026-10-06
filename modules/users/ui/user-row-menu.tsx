"use client"

import { MoreVertical } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
    label: string
}

export const UserRowMenu = ({ label }: Props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={label}
                className="relative z-20 inline-flex size-6 items-center justify-center rounded-full text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
                <MoreVertical className="size-4" />
                <DropdownMenuContent className="w-40" align="start">
                    <DropdownMenuGroup>
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Update</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenuTrigger>
        </DropdownMenu>
    )
}
