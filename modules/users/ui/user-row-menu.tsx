"use client"

import { MoreVertical } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/navigation"

import type { EditableUser } from "../hooks/use-update-user-dialog"
import { UpdateUserDialog } from "./update-user-dialog"

type Props = {
    label: string
    user: EditableUser
}

export const UserRowMenu = ({ label, user }: Props) => {
    const tDialog = useTranslations("Users.dialog")
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const shouldOpenUpdateRef = useRef(false)

    const handleUpdate = () => {
        shouldOpenUpdateRef.current = true
    }

    const handleMenuOpenChangeComplete = (open: boolean) => {
        if (open || !shouldOpenUpdateRef.current) return

        shouldOpenUpdateRef.current = false
        setIsUpdateOpen(true)
    }

    return (
        <>
            <DropdownMenu onOpenChangeComplete={handleMenuOpenChangeComplete}>
                <DropdownMenuTrigger
                    aria-label={label}
                    className="relative z-20 inline-flex size-6 items-center justify-center rounded-full text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="start">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            nativeButton={false}
                            render={<Link href={`/users/${user.id}/profile`} />}
                        >
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleUpdate}>
                            {tDialog("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <UpdateUserDialog
                user={user}
                open={isUpdateOpen}
                onOpenChange={setIsUpdateOpen}
            />
        </>
    )
}
