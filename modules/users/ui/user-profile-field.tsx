"use client"

import { Input } from "@/components/ui/input"

import type { SelectOption } from "../select-option"

const selectClassName =
    "h-12 w-full appearance-none rounded-md border border-input bg-background px-4 text-sm text-foreground shadow-xs focus:ring-2 focus:ring-ring focus:outline-none enabled:cursor-pointer disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-100"

type TextFieldProps = {
    id: string
    label: string
    value: string
    disabled: boolean
    error?: string
    onChange: (value: string) => void
}

export const UserProfileTextField = ({
    id,
    label,
    value,
    disabled,
    error,
    onChange,
}: TextFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <Input
                id={id}
                type="text"
                label={label}
                placeholder={label}
                maxLength={100}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                error={error}
                className="h-12 rounded-md border-input bg-background text-foreground shadow-xs disabled:cursor-not-allowed"
            />
        </div>
    )
}

type SelectFieldProps = {
    label: string
    placeholder: string
    value: string
    options: SelectOption[]
    disabled: boolean
    error?: string
    onChange: (value: string) => void
}

export const UserProfileSelect = ({
    label,
    placeholder,
    value,
    options,
    disabled,
    error,
    onChange,
}: SelectFieldProps) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    className={selectClassName}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <span className="pointer-events-none absolute top-4 right-4 text-xs text-muted-foreground">
                    ▼
                </span>
            </div>
            {error ? (
                <span className="text-xs text-red-500">{error}</span>
            ) : null}
        </div>
    )
}
