"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import type { Mastery } from "@/gql/generated/graphql"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface UseEditSkillModalProps {
    isOpen: boolean
    onClose: () => void
    skillName: string
    currentMastery: Mastery | string | number
    onUpdate: (mastery: Mastery) => Promise<void>
}

export function useEditSkillModal({
    isOpen,
    onClose,
    skillName,
    currentMastery,
    onUpdate,
}: UseEditSkillModalProps) {
    const t = useTranslations("Skills.edit")
    const [mastery, setMastery] = useState<Mastery | "">(
        (currentMastery as Mastery) || "",
    )
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevSkill, setPrevSkill] = useState({
        skillName,
        currentMastery,
        isOpen,
    })

    if (
        isOpen &&
        (skillName !== prevSkill.skillName ||
            currentMastery !== prevSkill.currentMastery ||
            !prevSkill.isOpen)
    ) {
        setPrevSkill({ skillName, currentMastery, isOpen })
        setMastery((currentMastery as Mastery) || "")
        setError(null)
    }

    useBodyScrollLock(isOpen)

    const handleClose = () => {
        setError(null)
        onClose()
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()

        if (!mastery) {
            setError(t("errors.masteryRequired"))
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await onUpdate(mastery as Mastery)
            handleClose()
        } catch (err: unknown) {
            console.error("Failed to update skill:", err)
            setError(t("errors.failed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        t,
        mastery,
        setMastery: (value: Mastery | "" | null) => {
            setMastery(value ?? "")
            setError(null)
        },
        error,
        isSubmitting,
        isValid: Boolean(mastery),
        handleClose,
        handleSubmit,
    }
}
