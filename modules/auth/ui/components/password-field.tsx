"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export function PasswordField({
    label = "",
    error,
    ...props
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className="block text-sm font-medium">{label}</label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full border border-border/80 rounded-lg px-4 py-3 pr-10 bg-transparent text-sm placeholder:text-muted-foreground outline-none transition-colors focus-visible:ring-1 focus-visible:ring-primary"
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
