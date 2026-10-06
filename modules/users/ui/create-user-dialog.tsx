"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"

import { useCreateUserDialog } from "../hooks/use-create-user-dialog"
import { UserFormDialog } from "./user-form-dialog"

const PlusIcon = () => {
    return (
        <svg
            aria-hidden
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 shrink-0"
        >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#C63031" />
        </svg>
    )
}

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
                    render={
                        <Button
                            type="button"
                            variant="primaryV2"
                            className="h-10 w-[220px] gap-2 rounded-[40px] p-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] uppercase hover:border-transparent active:border-transparent active:bg-transparent"
                        />
                    }
                >
                    <PlusIcon />
                    {label}
                </DialogTrigger>
            }
        />
    )
}
