import { useState } from "react"

export function useAdminCrudState<T extends { id: string | number }>(
    initialItems: T[] = [],
) {
    const [prevInitial, setPrevInitial] = useState(initialItems)
    const [items, setItems] = useState<T[]>(initialItems)

    if (prevInitial !== initialItems) {
        setPrevInitial(initialItems)
        setItems(initialItems)
    }

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<T | null>(null)
    const [deletingItem, setDeletingItem] = useState<T | null>(null)

    const closeModal = () => {
        setIsCreateOpen(false)
        setEditingItem(null)
        setDeletingItem(null)
    }

    const addItem = (item: T) => {
        setItems((prev) => [...prev, item])
    }

    const updateItem = (id: string | number, updatedFields: Partial<T>) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, ...updatedFields } : item,
            ),
        )
    }

    const removeItem = (id: string | number) => {
        setItems((prev) => prev.filter((item) => item.id !== id))
    }

    return {
        items,
        setItems,
        isCreateOpen,
        setIsCreateOpen,
        editingItem,
        setEditingItem,
        deletingItem,
        setDeletingItem,
        closeModal,
        addItem,
        updateItem,
        removeItem,
    }
}
