"use client"

import { cn } from "cn"
import { type ReactNode } from "react"

import { Input } from "@/components/ui/input"

import type { SelectOption } from "../select-option"
import {
    createUserFieldClassName,
    CreateUserSelect,
    disabledUserFieldClassName,
} from "./create-user-fields"

export type UserFormField =
    | "email"
    | "password"
    | "firstName"
    | "lastName"
    | "departmentId"
    | "positionId"
    | "role"

type TextFieldProps = {
    type?: "text" | "email"
    label: string
    value: string
    showLabel: boolean
    disabled?: boolean
    onChange: (value: string) => void
}

export const UserFormTextField = ({
    type = "text",
    label,
    value,
    showLabel,
    disabled = false,
    onChange,
}: TextFieldProps) => {
    return (
        <Input
            type={type}
            label={showLabel ? label : undefined}
            aria-label={label}
            placeholder={disabled || showLabel ? undefined : label}
            autoComplete="off"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className={cn(
                createUserFieldClassName,
                disabled && disabledUserFieldClassName,
            )}
        />
    )
}

type SelectFieldProps = {
    label: string
    value: string
    options: SelectOption[]
    showLabel: boolean
    includeEmpty: boolean
    onChange: (value: string) => void
}

const FieldLabel = ({ children }: { children: ReactNode }) => {
    return (
        <span className="text-xs leading-4 text-button-secondary-default dark:text-[#aeaeae]">
            {children}
        </span>
    )
}

export const UserFormSelectField = ({
    label,
    value,
    options,
    showLabel,
    includeEmpty,
    onChange,
}: SelectFieldProps) => {
    const select = (
        <CreateUserSelect
            label={label}
            value={value}
            options={options}
            includeEmpty={includeEmpty}
            onChange={onChange}
        />
    )

    if (!showLabel) return select

    return (
        <label className="flex flex-col gap-1">
            <FieldLabel>{label}</FieldLabel>
            {select}
        </label>
    )
}
