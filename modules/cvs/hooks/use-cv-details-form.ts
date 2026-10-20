import { useState } from "react"

import type { CvItem, UpdateCvDto } from "../types"

interface UseCvDetailsFormProps {
    cv: CvItem
    onUpdate: (data: UpdateCvDto) => Promise<void> | void
    updateErrorText: string
}

export function useCvDetailsForm({
    cv,
    onUpdate,
    updateErrorText,
}: UseCvDetailsFormProps) {
    const [name, setName] = useState(cv.name)
    const [education, setEducation] = useState(cv.education)
    const [description, setDescription] = useState(cv.description)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{
        name?: string
        education?: string
        description?: string
    }>({})

    const isDirty =
        name !== cv.name ||
        education !== cv.education ||
        description !== cv.description

    const validateFields = () => {
        const errors: typeof fieldErrors = {}

        if (!name.trim()) {
            errors.name = "Name is required"
        } else if (name.length > 255) {
            errors.name = "Name must be 255 characters or less"
        }

        if (!education.trim()) {
            errors.education = "Education is required"
        } else if (education.length > 255) {
            errors.education = "Education must be 255 characters or less"
        }

        if (!description.trim()) {
            errors.description = "Description is required"
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateFields()) {
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)
            await onUpdate({ name, education, description })
        } catch {
            setError(updateErrorText)
        } finally {
            setIsSubmitting(false)
        }
    }

    const hasValidationErrors = Object.keys(fieldErrors).length > 0

    return {
        name,
        setName,
        education,
        setEducation,
        description,
        setDescription,
        isSubmitting,
        error,
        fieldErrors,
        isDirty,
        handleSubmit,
        hasValidationErrors,
    }
}
