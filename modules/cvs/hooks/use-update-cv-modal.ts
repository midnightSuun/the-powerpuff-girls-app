import { useState } from "react"

interface CvItem {
    id: string
    name: string
    education: string
    description: string
}

interface UseUpdateCvModalProps {
    cv: CvItem | null
    onUpdate: (data: {
        name: string
        education: string
        description: string
    }) => Promise<void> | void
}

export function useUpdateCvModal({ cv, onUpdate }: UseUpdateCvModalProps) {
    const [name, setName] = useState(cv?.name ?? "")
    const [education, setEducation] = useState(cv?.education ?? "")
    const [description, setDescription] = useState(cv?.description ?? "")
    const [hasSubmitted, setHasSubmitted] = useState(false)

    const isValid =
        name.trim().length > 0 &&
        education.trim().length > 0 &&
        description.trim().length > 0

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        setHasSubmitted(true)
        if (!isValid) return
        await onUpdate({ name, education, description })
    }

    return {
        name,
        setName,
        education,
        setEducation,
        description,
        setDescription,
        hasSubmitted,
        isValid,
        handleSubmit,
    }
}
