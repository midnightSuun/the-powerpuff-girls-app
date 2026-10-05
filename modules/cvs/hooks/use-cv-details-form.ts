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

    const isDirty =
        name !== cv.name ||
        education !== cv.education ||
        description !== cv.description

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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

    return {
        name,
        setName,
        education,
        setEducation,
        description,
        setDescription,
        isSubmitting,
        error,
        isDirty,
        handleSubmit,
    }
}
