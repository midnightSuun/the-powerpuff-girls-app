import { useState } from "react"

interface UseCreateCvProps {
    onCreate: (data: {
        name: string
        education: string
        description: string
    }) => Promise<void> | void
}

export function useCreateCv({ onCreate }: UseCreateCvProps) {
    const [name, setName] = useState("")
    const [education, setEducation] = useState("")
    const [description, setDescription] = useState("")

    const isValid =
        name.trim().length > 0 &&
        education.trim().length > 0 &&
        description.trim().length > 0

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!isValid) return
        await onCreate({ name, education, description })
    }

    return {
        name,
        setName,
        education,
        setEducation,
        description,
        setDescription,
        isValid,
        handleSubmit,
    }
}
