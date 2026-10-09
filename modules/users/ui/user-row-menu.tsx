"use client"

import { MoreVertical } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { Link, useRouter } from "@/i18n/navigation"

import { deleteUser } from "../api/delete-user"
import type { EditableUser } from "../hooks/use-update-user-dialog"
import { UpdateUserDialog } from "./update-user-dialog"

type Props = {
    label: string
    user: EditableUser
}

type PendingAction = "update" | "delete"

const cancelButtonClassName =
    "h-10 w-40 rounded-[40px] border-button-secondary-default bg-transparent px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] text-button-secondary-default uppercase shadow-none hover:bg-button-disabled hover:text-text-primary-default active:border-button-secondary-default active:bg-button-secondary-default active:text-button-secondary-default dark:border-[#aeaeae] dark:text-[#aeaeae] dark:hover:bg-transparent dark:hover:text-[#f5f5f7]"

const confirmButtonClassName =
    "h-10 w-40 rounded-[40px] border-transparent bg-[#c63031] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] text-[#f5f5f7] uppercase shadow-none hover:border-transparent hover:bg-[#b02a2b] hover:text-[#f5f5f7] active:border-transparent active:bg-[#c63031] active:text-[#f5f5f7]"

const getUserLabel = (user: EditableUser) => {
    const name =
        `${user.profile.first_name ?? ""} ${user.profile.last_name ?? ""}`.trim()

    return name || user.email
}

export const UserRowMenu = ({ label, user }: Props) => {
    const tDialog = useTranslations("Users.dialog")
    const tMessages = useTranslations("Users.messages")
    const notifications = useActionNotifications()
    const router = useRouter()
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const pendingActionRef = useRef<PendingAction | null>(null)

    const handleUpdate = () => {
        pendingActionRef.current = "update"
    }

    const handleDelete = () => {
        pendingActionRef.current = "delete"
    }

    const handleMenuOpenChangeComplete = (open: boolean) => {
        if (open || !pendingActionRef.current) return

        const action = pendingActionRef.current
        pendingActionRef.current = null

        if (action === "update") setIsUpdateOpen(true)
        if (action === "delete") {
            setDeleteError(null)
            setIsDeleteOpen(true)
        }
    }

    const handleCloseDelete = () => {
        if (isDeleting) return

        setDeleteError(null)
        setIsDeleteOpen(false)
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        setDeleteError(null)

        const result = await deleteUser(user.id)

        setIsDeleting(false)

        if (!result.success) {
            setDeleteError(result.error ?? tMessages("deleteFailed"))
            return
        }

        notifications.success("deleted")
        setIsDeleteOpen(false)
        router.refresh()
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
                            {tDialog("view")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleUpdate}>
                            {tDialog("update")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>
                            {tDialog("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <UpdateUserDialog
                user={user}
                open={isUpdateOpen}
                onOpenChange={setIsUpdateOpen}
            />
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                title={tDialog("deleteTitle")}
                description={tDialog.rich("deleteDescription", {
                    name: getUserLabel(user),
                    strong: (chunks) => (
                        <strong className="font-semibold">{chunks}</strong>
                    ),
                })}
                cancelText={tDialog("cancel")}
                confirmText={tDialog("confirm")}
                deletingText={tDialog("deleting")}
                isDeleting={isDeleting}
                error={deleteError}
                cancelButtonClassName={cancelButtonClassName}
                confirmButtonClassName={confirmButtonClassName}
            />
        </>
    )
}
