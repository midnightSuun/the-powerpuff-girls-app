import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ListActionButtonProps {
    label: string
    onClick?: () => void
    disabled?: boolean
    className?: string
    variant?: "ghost" | "primaryV2" | "primary" | "secondary"
}

interface AddItemButtonProps extends ListActionButtonProps {
    iconOnlyBelowLg?: boolean
}

export function AddItemButton({
    label,
    onClick,
    disabled,
    className,
    iconOnlyBelowLg = false,
    variant = "ghost",
}: AddItemButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            aria-label={iconOnlyBelowLg ? label : undefined}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap ${
                iconOnlyBelowLg
                    ? "h-8 w-8 min-w-0 p-0 lg:h-auto lg:w-auto lg:px-4 lg:py-2"
                    : ""
            } ${className || ""}`}
            onClick={onClick}
            disabled={disabled}
        >
            <Plus className="h-5 w-5 shrink-0" />
            <span
                className={`whitespace-nowrap ${iconOnlyBelowLg ? "hidden lg:inline" : ""}`}
            >
                {label}
            </span>
        </Button>
    )
}

export function RemoveItemsButton({
    label,
    onClick,
    disabled,
    className,
    variant = "primaryV2",
}: ListActionButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            className={`inline-flex w-auto max-w-full items-center justify-center gap-2 whitespace-nowrap ${
                className || ""
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            <Trash2 className="h-5 w-5 shrink-0" />
            <span className="min-w-0 whitespace-nowrap">{label}</span>
        </Button>
    )
}
