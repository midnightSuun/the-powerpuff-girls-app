"use client"

import { cn } from "cn"

import { Input } from "@/components/ui/input"

import type { SelectOption } from "../select-option"
import {
    createUserFieldClassName,
    CreateUserFloatingLabel,
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
    const showFloatingLabel = showLabel || value.length > 0

    return (
        <div className="relative pt-4">
            {showFloatingLabel && (
                <CreateUserFloatingLabel>{label}</CreateUserFloatingLabel>
            )}
            <Input
                type={type}
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
        </div>
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

export const UserFormSelectField = ({
    label,
    value,
    options,
    showLabel,
    includeEmpty,
    onChange,
}: SelectFieldProps) => {
    const showFloatingLabel = showLabel || value.length > 0

    return (
        <div className="relative pt-4">
            {showFloatingLabel && (
                <CreateUserFloatingLabel>{label}</CreateUserFloatingLabel>
            )}
            <CreateUserSelect
                label={label}
                value={value}
                options={options}
                includeEmpty={includeEmpty}
                showPlaceholder={!showFloatingLabel}
                onChange={onChange}
            />
        </div>
    )
}
