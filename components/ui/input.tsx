import { Input as InputPrimitive } from "@base-ui/react/input"
import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
    label?: string
    error?: string
    endAdornment?: React.ReactNode
}

function Input({
    className,
    type,
    id,
    label,
    error,
    endAdornment,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    disabled,
    value,
    defaultValue,
    ...props
}: InputProps) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const describedBy = [ariaDescribedBy, error ? errorId : undefined]
        .filter(Boolean)
        .join(" ")

    const [isFocused, setIsFocused] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(
        defaultValue !== undefined ? String(defaultValue) : "",
    )

    // Если компонент управляемый (передан value), берем его, иначе используем внутренний стейт инпута
    const currentValue = value !== undefined ? value : internalValue
    const hasValue = Boolean(currentValue)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (value === undefined) {
            setInternalValue(e.target.value)
        }
        props.onChange?.(e)
    }

    const shouldShowLabel = isFocused || hasValue || Boolean(error) || disabled

    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "block text-xs font-medium ml-4 transition-all duration-200 select-none",
                        shouldShowLabel
                            ? "opacity-100 h-auto"
                            : "opacity-0 h-0 overflow-hidden pointer-events-none",
                        error ? "text-destructive" : "text-muted-foreground",
                    )}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <InputPrimitive
                    id={inputId}
                    type={type}
                    data-slot="input"
                    disabled={disabled}
                    value={value}
                    defaultValue={defaultValue}
                    onFocus={(e) => {
                        setIsFocused(true)
                        props.onFocus?.(e)
                    }}
                    onBlur={(e) => {
                        setIsFocused(false)
                        props.onBlur?.(e)
                    }}
                    onChange={handleInputChange}
                    aria-describedby={describedBy || undefined}
                    aria-invalid={error ? true : ariaInvalid}
                    className={cn(
                        "h-12 w-full min-w-0 rounded-lg border border-[#AEAEAE] bg-transparent px-4 py-3 text-base transition-colors outline-none",
                        "hover:border-button-secondary-default",
                        "focus-visible:border-button-secondary-default focus-visible:ring-0",
                        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[#C4C4C6] disabled:bg-[#C4C4C6]/10 disabled:opacity-60",
                        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
                        "placeholder:text-muted-foreground text-foreground md:text-sm",
                        endAdornment && "pr-10",
                        className,
                    )}
                    {...props}
                />
                {endAdornment}
            </div>

            {error && (
                <p
                    id={errorId}
                    className="text-xs text-destructive ml-4"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    )
}

export { Input }
