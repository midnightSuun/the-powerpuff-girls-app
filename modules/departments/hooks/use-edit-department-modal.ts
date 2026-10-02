import { useState } from "react"

import { AdminDepartmentItem } from "./use-admin-departments-view"

export interface UseEditDepartmentModalProps {
    isOpen: boolean
    department: AdminDepartmentItem | null
    existingNames?: string[]
    onClose: () => void
    onUpdate: (id: string, data: { name: string }) => Promise<void>
}

export function useEditDepartmentModal({
    isOpen,
    department,
    existingNames = [],
    onClose,
    onUpdate,
}: UseEditDepartmentModalProps) {
    const [prevDepartment, setPrevDepartment] = useState(department)
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    const [name, setName] = useState(department?.name ?? "")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (prevDepartment !== department || prevIsOpen !== isOpen) {
        setPrevDepartment(department)
        setPrevIsOpen(isOpen)
        setName(department?.name ?? "")
        setError(null)
    }

    const trimmedName = name.trim()

    const isDuplicate = existingNames.some(
        (n) =>
            department &&
            n.toLowerCase() === trimmedName.toLowerCase() &&
            n.toLowerCase() !== department.name.toLowerCase(),
    )

    const inlineError = isDuplicate ? "alreadyExists" : null
    const isValid = trimmedName.length > 0 && !inlineError

    const handleSubmit = async () => {
        if (!department || !isValid) return

        try {
            setIsSubmitting(true)
            setError(null)
            await onUpdate(department.id, { name: trimmedName })
            onClose()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update department",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name,
        setName,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
