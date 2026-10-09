"use client"

import { useTranslations } from "next-intl"

import { DialogTrigger } from "@/components/ui/dialog"
import { AddItemButton } from "@/components/ui/list-management-buttons"

import { useCreateUserDialog } from "../../../hooks/use-create-user-dialog"
import { UserFormDialog } from "./user-form-dialog"

type Props = {
    label: string
}

const createUserButtonClassName =
    "h-10 gap-2 rounded-[40px] border border-transparent bg-transparent p-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] text-button-primary-default uppercase shadow-none hover:border-button-primary-default hover:bg-transparent hover:text-button-primary-default active:translate-y-0 active:border-button-primary-default active:bg-button-primary-active active:text-button-primary-default disabled:border-transparent disabled:bg-button-disabled disabled:text-text-primary-disabled disabled:opacity-100 lg:!h-10 lg:!w-[220px] lg:!min-w-0 lg:!px-0 lg:!py-0"

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
                    render={
                        <AddItemButton
                            label={label}
                            variant="primaryV2"
                            className={createUserButtonClassName}
                        />
                    }
                />
            }
        />
    )
}
