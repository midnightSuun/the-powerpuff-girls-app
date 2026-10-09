"use client"

import { useTranslations } from "next-intl"

import { DialogTrigger } from "@/components/ui/dialog"
import { AddItemButton } from "@/components/ui/list-management-buttons"

import { useCreateUserDialog } from "../hooks/use-create-user-dialog"
import { UserFormDialog } from "./user-form-dialog"

type Props = {
    label: string
}

export const CreateUserDialog = ({ label }: Props) => {
    const t = useTranslations("Users")
    const tDialog = useTranslations("Users.dialog")
    const {
        isOpen,
        isSubmitting,
        form,
        departments,
        positions,
        roleOptions,
        handleOpenChange,
        handleChange,
        handleSubmit,
    } = useCreateUserDialog()

    return (
        <UserFormDialog
            open={isOpen}
            onOpenChange={handleOpenChange}
            title={t("createUser")}
            description={tDialog("description")}
            submitLabel={tDialog("submit")}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            email={form.email}
            password={form.password}
            firstName={form.firstName}
            lastName={form.lastName}
            departmentId={form.departmentId}
            positionId={form.positionId}
            role={form.role}
            departments={departments}
            positions={positions}
            roleOptions={roleOptions}
            onFieldChange={handleChange}
            trigger={
                <DialogTrigger
                    render={<AddItemButton label={label} variant="primaryV2" />}
                />
            }
        />
    )
}
