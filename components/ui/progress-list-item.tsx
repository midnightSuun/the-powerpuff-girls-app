import { ProgressItem } from "@/components/ui/progress-item"

interface ProgressListItemProps {
    name: string
    mastery: string | number
    isSelectionMode?: boolean
    isSelected?: boolean
    onSelect?: () => void
    onEdit?: () => void
}

export function ProgressListItem({
    name,
    mastery,
    isSelectionMode = false,
    isSelected = false,
    onSelect,
    onEdit,
}: ProgressListItemProps) {
    const handleClick = () => {
        if (isSelectionMode) {
            onSelect?.()
        } else {
            onEdit?.()
        }
    }

    return (
        <div
            onClick={handleClick}
            className={`flex items-center justify-between rounded px-2 py-1.5 transition-colors ${
                isSelectionMode || onEdit ? "cursor-pointer" : ""
            } ${
                isSelectionMode
                    ? "hover:bg-accent dark:hover:bg-accent/50"
                    : "hover:bg-accent/50"
            } ${
                isSelected
                    ? "bg-red-50 ring-1 ring-red-500 dark:bg-red-950/30"
                    : ""
            }`}
        >
            <ProgressItem
                name={name}
                mastery={mastery}
                isSelected={isSelected}
            />
        </div>
    )
}
