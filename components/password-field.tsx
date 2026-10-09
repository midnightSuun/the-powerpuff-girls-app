"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PasswordFieldProps extends React.ComponentProps<"input"> {
    label?: string
    error?: string
}

export function PasswordField({
    label,
    error,
    className,
    ...props
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <Input
            type={showPassword ? "text" : "password"}
            label={label}
            error={error}
            className={cn(
                "pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-password-toggle-button]:appearance-none",
                className,
            )}
            endAdornment={
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            }
            {...props}
        />
    )
}
