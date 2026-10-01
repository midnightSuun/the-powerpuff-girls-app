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
            className="gap-2 border-transparent text-muted-foreground hover:text-foreground"
            onClick={onClick}
            disabled={disabled}
        >
            <Plus className="h-5 w-5" />
            {label}
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
            className="gap-2"
            onClick={onClick}
            disabled={disabled}
        >
            <Trash2 className="h-5 w-5" />
            {label}
        </Button>
    )
}
