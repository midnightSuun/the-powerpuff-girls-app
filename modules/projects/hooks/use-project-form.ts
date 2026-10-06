import { useTranslations } from "next-intl"
import { type SyntheticEvent, useState } from "react"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

import type { ProjectFormData } from "./use-admin-projects"

interface UseProjectFormProps {
    isOpen: boolean
    project?: ProjectTableItem | null
    onClose: () => void
    onSave: (
        project: ProjectTableItem | null,
        data: ProjectFormData,
    ) => Promise<void>
}

function toDateInputValue(value?: string | null) {
    if (!value) return ""
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

export function useProjectForm({
    isOpen,
    project,
    onClose,
    onSave,
}: UseProjectFormProps) {
    const t = useTranslations("Admin.projects.form")
    const [name, setName] = useState(project?.name ?? "")
    const [domain, setDomain] = useState(project?.domain ?? "")
    const [startDate, setStartDate] = useState(
        toDateInputValue(project?.start_date),
    )
    const [endDate, setEndDate] = useState(toDateInputValue(project?.end_date))
    const [description, setDescription] = useState(project?.description ?? "")
    const [environment, setEnvironment] = useState(project?.environment ?? [])
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useBodyScrollLock(isOpen)

    const isValid = Boolean(
        name.trim() && domain.trim() && startDate && description.trim(),
    )

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault()
        if (!isValid) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onSave(project ?? null, {
                name: name.trim(),
                domain: domain.trim(),
                start_date: startDate,
                end_date: endDate || null,
                description: description.trim(),
                environment,
            })
            onClose()
        } catch (caughtError) {
            console.error("Failed to save project:", caughtError)
            setError(t("saveError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        t,
        name,
        setName,
        domain,
        setDomain,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        description,
        setDescription,
        environment,
        setEnvironment,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
