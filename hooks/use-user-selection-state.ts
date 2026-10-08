import { useState } from "react"

export function useUserSelectionState<T = string>() {
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedItems, setSelectedItems] = useState<T[]>([])

    const toggleSelection = (item: T) => {
        setSelectedItems((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item],
        )
    }

    const clearSelection = () => setSelectedItems([])

    const resetSelection = () => {
        setIsSelectionMode(false)
        setSelectedItems([])
    }

    return {
        isSelectionMode,
        setIsSelectionMode,
        selectedItems,
        setSelectedItems,
        toggleSelection,
        clearSelection,
        resetSelection,
    }
}
