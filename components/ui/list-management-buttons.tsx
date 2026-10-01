import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ListActionButtonProps {
    label: string
    onClick: () => void
    disabled?: boolean
}

export function AddItemButton({
    label,
    onClick,
    disabled,
}: ListActionButtonProps) {
    return (
        <Button
            variant="ghost"
            className="inline-flex items-center justify-center gap-2 px-4 border-transparent text-muted-foreground hover:text-foreground whitespace-nowrap"
            onClick={onClick}
            disabled={disabled}
        >
            <Plus className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
        </Button>
    )
}

export function RemoveItemsButton({
    label,
    onClick,
    disabled,
}: ListActionButtonProps) {
    return (
        <Button
            variant="primaryV2"
            className="inline-flex w-auto max-w-full items-center justify-center gap-2 px-4 whitespace-normal"
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
