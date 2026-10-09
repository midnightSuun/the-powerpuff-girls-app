"use client"

import { useTranslations } from "next-intl"
import { type SubmitEvent } from "react"

import {
    type EditableUser,
    useUpdateUserDialog,
} from "../../../hooks/use-update-user-dialog"
import { UserFormDialog, type UserFormField } from "./user-form-dialog"

type Props = {
    user: EditableUser
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const UpdateUserDialog = ({ user, open, onOpenChange }: Props) => {
    const tDialog = useTranslations("Users.dialog")
    const {
        isSubmitting,
        form,
        departments,
        positions,
        roleOptions,
        handleChange,
        handleSubmit,
    } = useUpdateUserDialog(user, open)

    const handleFieldChange = (field: UserFormField, value: string) => {
        if (field === "email" || field === "password") return
        handleChange(field, value)
    }

    const handleFormSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        const updated = await handleSubmit(event)
        if (updated) onOpenChange(false)
    }

    return (
        <UserFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={tDialog("updateTitle")}
            description={tDialog("updateDescription")}
            submitLabel={tDialog("update")}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            showFieldLabels
            lockCredentials
            email={user.email}
            password=""
            firstName={form.firstName}
            lastName={form.lastName}
            departmentId={form.departmentId}
            positionId={form.positionId}
            role={form.role}
            departments={departments}
            positions={positions}
            roleOptions={roleOptions}
            onFieldChange={handleFieldChange}
        />
    )
}
