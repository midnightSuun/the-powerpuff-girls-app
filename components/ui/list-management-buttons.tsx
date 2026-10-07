import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ListActionButtonProps {
    label: string
    onClick?: () => void
    disabled?: boolean
    className?: string
}

interface AddItemButtonProps extends Omit<ListActionButtonProps, "onClick"> {
    onClick?: () => void
    iconOnlyBelowLg?: boolean
    variant?: "ghost" | "primaryV2"
}
export function AddItemButton({
    label,
    onClick,
    disabled,
    className,
    iconOnlyBelowLg = true,
    variant = "ghost",
}: AddItemButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            aria-label={iconOnlyBelowLg ? label : undefined}
            className={`inline-flex items-center justify-center gap-2 px-4 border-transparent text-muted-foreground hover:text-foreground whitespace-nowrap ${
                iconOnlyBelowLg
                    ? "!h-8 !w-8 !min-w-0 !p-0 lg:!h-9 lg:!w-auto lg:!px-2 lg:!py-0"
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
}: ListActionButtonProps) {
    return (
        <Button
            type="button"
            variant="primaryV2"
            className={`inline-flex w-auto max-w-full items-center justify-center gap-2 px-4 whitespace-normal ${
                className || ""
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            <Trash2 className="h-5 w-5 shrink-0" />
            <span className="min-w-0 wrap-break-word whitespace-normal">
                {label}
            </span>
        </Button>
    )
}
