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
    ...props
}: InputProps) {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const describedBy = [ariaDescribedBy, error ? errorId : undefined]
        .filter(Boolean)
        .join(" ")

    return (
        <div className="w-full space-y-1">
            <div className="relative">
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "absolute -top-4.5 left-3.5 px-1 bg-background text-xs font-medium transition-colors pointer-events-none select-none z-10",
                            error
                                ? "text-destructive"
                                : "text-muted-foreground",
                        )}
                    >
                        {label}
                    </label>
                )}
                <InputPrimitive
                    id={inputId}
                    type={type}
                    data-slot="input"
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
                    className="text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    )
}

export { Input }
