"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ReactNode, type SubmitEvent } from "react"

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
import { Input } from "@/components/ui/input"

import {
    createUserFieldClassName,
    CreateUserPasswordInput,
    CreateUserSelect,
} from "./create-user-fields"

const disabledFieldClassName =
    "disabled:bg-[#e6e6e6] disabled:text-[#626262] disabled:opacity-100 dark:disabled:bg-[#3a3a3a] dark:disabled:text-[#aeaeae]"

const secondaryButtonClassName =
    "h-10 w-40 rounded-[40px] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] uppercase dark:border-[#aeaeae] dark:text-[#aeaeae] dark:hover:bg-transparent dark:hover:text-[#f5f5f7]"

const primaryButtonClassName =
    "h-10 w-40 rounded-[40px] bg-[#c63031] px-6 py-0 text-sm leading-[24.5px] font-medium tracking-[0.4px] text-[#f5f5f7] uppercase hover:border-transparent hover:bg-[#b02a2b] hover:text-[#f5f5f7] active:border-transparent active:bg-[#c63031] active:text-[#f5f5f7]"

const dialogClassName =
    "flex max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-6 overflow-y-auto rounded-lg bg-white p-8 text-[#2e2e2e] shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-0 sm:max-w-[720px] dark:bg-[#2e2e2e] dark:text-[#f5f5f7]"

const closeClassName =
    "inline-flex size-8 shrink-0 items-center justify-center text-[#626262] outline-none hover:text-[#2e2e2e] focus-visible:ring-3 focus-visible:ring-[#c63031]/30 dark:text-[#aeaeae] dark:hover:text-[#f5f5f7]"

const hiddenPassword = "••••••••"

export type UserFormField =
    | "email"
    | "password"
    | "firstName"
    | "lastName"
    | "departmentId"
    | "positionId"
    | "role"

type SelectOption = {
    id: string
    name: string
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    submitLabel: string
    isSubmitting: boolean
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
    trigger?: ReactNode
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

const Field = ({
    label,
    children,
}: {
    label?: string
    children: ReactNode
}) => {
    if (!label) return children

    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs leading-4 text-[#626262] dark:text-[#aeaeae]">
                {label}
            </span>
            {children}
        </label>
    )
}

export const UserFormDialog = ({
    open,
    onOpenChange,
    title,
    description,
    submitLabel,
    isSubmitting,
    onSubmit,
    trigger,
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
    const labelFor = (label: string) => (showFieldLabels ? label : undefined)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger}
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
                        <Field label={labelFor(tColumns("email"))}>
                            <Input
                                type="email"
                                aria-label={tColumns("email")}
                                placeholder={
                                    lockCredentials
                                        ? undefined
                                        : tColumns("email")
                                }
                                autoComplete="off"
                                value={email}
                                disabled={lockCredentials}
                                onChange={(event) =>
                                    onFieldChange("email", event.target.value)
                                }
                                className={
                                    lockCredentials
                                        ? `${createUserFieldClassName} ${disabledFieldClassName}`
                                        : createUserFieldClassName
                                }
                            />
                        </Field>
                        <Field label={labelFor(tDialog("password"))}>
                            <CreateUserPasswordInput
                                label={tDialog("password")}
                                value={
                                    lockCredentials ? hiddenPassword : password
                                }
                                disabled={lockCredentials}
                                onChange={(value) =>
                                    onFieldChange("password", value)
                                }
                            />
                        </Field>
                        <Field label={labelFor(tColumns("firstName"))}>
                            <Input
                                aria-label={tColumns("firstName")}
                                placeholder={
                                    showFieldLabels
                                        ? undefined
                                        : tColumns("firstName")
                                }
                                autoComplete="off"
                                value={firstName}
                                onChange={(event) =>
                                    onFieldChange(
                                        "firstName",
                                        event.target.value,
                                    )
                                }
                                className={createUserFieldClassName}
                            />
                        </Field>
                        <Field label={labelFor(tColumns("lastName"))}>
                            <Input
                                aria-label={tColumns("lastName")}
                                placeholder={
                                    showFieldLabels
                                        ? undefined
                                        : tColumns("lastName")
                                }
                                autoComplete="off"
                                value={lastName}
                                onChange={(event) =>
                                    onFieldChange(
                                        "lastName",
                                        event.target.value,
                                    )
                                }
                                className={createUserFieldClassName}
                            />
                        </Field>
                        <Field label={labelFor(tColumns("department"))}>
                            <CreateUserSelect
                                label={tColumns("department")}
                                value={departmentId}
                                options={departments}
                                includeEmpty={
                                    !showFieldLabels ||
                                    departmentId.length === 0
                                }
                                onChange={(value) =>
                                    onFieldChange("departmentId", value)
                                }
                            />
                        </Field>
                        <Field label={labelFor(tColumns("position"))}>
                            <CreateUserSelect
                                label={tColumns("position")}
                                value={positionId}
                                options={positions}
                                includeEmpty={
                                    !showFieldLabels || positionId.length === 0
                                }
                                onChange={(value) =>
                                    onFieldChange("positionId", value)
                                }
                            />
                        </Field>
                        <Field label={tUser("role")}>
                            <CreateUserSelect
                                label={tUser("role")}
                                value={role}
                                options={roleOptions}
                                includeEmpty={false}
                                onChange={(value) =>
                                    onFieldChange("role", value)
                                }
                            />
                        </Field>
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
