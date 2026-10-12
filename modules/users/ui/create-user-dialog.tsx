"use client"

import { useTranslations } from "next-intl"

import { useHeaderToolbarAction } from "@/components/header-toolbar-action"

import { useCreateUserDialog } from "../hooks/use-create-user-dialog"
import { UserFormDialog } from "./user-form-dialog"

export const CreateUserDialog = () => {
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

    useHeaderToolbarAction(t("createUser"), () => {
        handleOpenChange(true)
    })

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
        />
    )
}
