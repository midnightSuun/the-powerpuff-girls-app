"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { type SubmitEvent } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import type { SelectOption } from "../select-option"
import { CreateUserPasswordInput } from "./create-user-fields"
import {
    type UserFormField,
    UserFormSelectField,
    UserFormTextField,
} from "./user-form-field"

export type { UserFormField }

const secondaryButtonClassName =
    "h-10 w-40 rounded-[40px] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] uppercase dark:border-[#aeaeae] dark:text-[#aeaeae] dark:hover:bg-transparent dark:hover:text-[#f5f5f7]"

const primaryButtonClassName =
    "h-10 w-40 rounded-[40px] bg-[#c63031] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] text-[#f5f5f7] uppercase hover:border-transparent hover:bg-[#b02a2b] hover:text-[#f5f5f7] active:border-transparent active:bg-[#c63031] active:text-[#f5f5f7]"

const dialogClassName =
    "flex max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-6 overflow-y-auto rounded-lg bg-white p-8 text-[#2e2e2e] shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-0 sm:max-w-[720px] dark:bg-[#2e2e2e] dark:text-[#f5f5f7]"

const closeClassName =
    "inline-flex size-8 shrink-0 items-center justify-center text-[#626262] outline-none hover:text-[#2e2e2e] focus-visible:ring-3 focus-visible:ring-[#c63031]/30 dark:text-[#aeaeae] dark:hover:text-[#f5f5f7]"

const hiddenPassword = "••••••••"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    submitLabel: string
    isSubmitting: boolean
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
    showFieldLabels?: boolean
    lockCredentials?: boolean
    email: string
    password: string
    firstName: string
    lastName: string
    departmentId: string
    positionId: string
    role: string
    departments: SelectOption[]
    positions: SelectOption[]
    roleOptions: SelectOption[]
    onFieldChange: (field: UserFormField, value: string) => void
}

export const UserFormDialog = ({
    open,
    onOpenChange,
    title,
    description,
    submitLabel,
    isSubmitting,
    onSubmit,
    showFieldLabels = false,
    lockCredentials = false,
    email,
    password,
    firstName,
    lastName,
    departmentId,
    positionId,
    role,
    departments,
    positions,
    roleOptions,
    onFieldChange,
}: Props) => {
    const tDialog = useTranslations("Users.dialog")
    const tColumns = useTranslations("Users.columns")
    const tUser = useTranslations("User")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                overlayClassName="bg-black/50 backdrop-blur-none"
                className={dialogClassName}
            >
                <DialogHeader className="flex-row items-center justify-between gap-4">
                    <DialogTitle className="text-xl leading-7 font-medium tracking-[0.15px] text-[#2e2e2e] dark:text-[#f5f5f7]">
                        {title}
                    </DialogTitle>
                    <DialogClose
                        aria-label={tDialog("close")}
                        className={closeClassName}
                    >
                        <X className="size-6" />
                    </DialogClose>
                </DialogHeader>
                <DialogDescription className="sr-only">
                    {description}
                </DialogDescription>
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <UserFormTextField
                            type="email"
                            label={tColumns("email")}
                            value={email}
                            showLabel={showFieldLabels}
                            disabled={lockCredentials}
                            onChange={(value) => onFieldChange("email", value)}
                        />
                        <CreateUserPasswordInput
                            label={tDialog("password")}
                            showLabel={showFieldLabels}
                            value={lockCredentials ? hiddenPassword : password}
                            disabled={lockCredentials}
                            onChange={(value) =>
                                onFieldChange("password", value)
                            }
                        />
                        <UserFormTextField
                            label={tColumns("firstName")}
                            value={firstName}
                            showLabel={showFieldLabels}
                            onChange={(value) =>
                                onFieldChange("firstName", value)
                            }
                        />
                        <UserFormTextField
                            label={tColumns("lastName")}
                            value={lastName}
                            showLabel={showFieldLabels}
                            onChange={(value) =>
                                onFieldChange("lastName", value)
                            }
                        />
                        <UserFormSelectField
                            label={tColumns("department")}
                            value={departmentId}
                            options={departments}
                            showLabel={showFieldLabels}
                            includeEmpty={
                                !showFieldLabels || departmentId.length === 0
                            }
                            onChange={(value) =>
                                onFieldChange("departmentId", value)
                            }
                        />
                        <UserFormSelectField
                            label={tColumns("position")}
                            value={positionId}
                            options={positions}
                            showLabel={showFieldLabels}
                            includeEmpty={
                                !showFieldLabels || positionId.length === 0
                            }
                            onChange={(value) =>
                                onFieldChange("positionId", value)
                            }
                        />
                        <UserFormSelectField
                            label={tUser("role")}
                            value={role}
                            options={roleOptions}
                            showLabel
                            includeEmpty={false}
                            onChange={(value) => onFieldChange("role", value)}
                        />
                    </div>
                    <DialogFooter className="mx-0 mt-2 mb-0 flex-row flex-wrap justify-end gap-3 rounded-none border-0 border-t-0 bg-transparent p-0">
                        <DialogClose
                            render={
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className={secondaryButtonClassName}
                                />
                            }
                        >
                            {tDialog("cancel")}
                        </DialogClose>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            className={primaryButtonClassName}
                        >
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
