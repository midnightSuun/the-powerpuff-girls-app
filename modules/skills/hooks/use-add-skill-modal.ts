"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import type { Mastery } from "@/gql/generated/graphql"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

import { addCvSkills } from "../api/skills"

export interface SkillOption {
    id: string
    name: string
    categoryId: string
}

export interface UserSkill {
    name: string
}

interface UseAddSkillModalProps {
    isOpen: boolean
    onClose: () => void
    cvId: string
    existingSkills?: UserSkill[]
    availableSkills?: SkillOption[]
}

export function useAddSkillModal({
    isOpen,
    onClose,
    cvId,
    existingSkills = [],
    availableSkills = [],
}: UseAddSkillModalProps) {
    const t = useTranslations("Skills.add")
    const router = useRouter()
    const [selectedSkillId, setSelectedSkillId] = useState("")
    const [mastery, setMastery] = useState<Mastery | "">("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useBodyScrollLock(isOpen)

    const handleClose = () => {
        setSelectedSkillId("")
        setMastery("")
        setError(null)
        onClose()
    }

    const unselectedSkills = availableSkills.filter(
        (available) =>
            !existingSkills.some(
                (existing) => existing.name === available.name,
            ),
    )

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()

        if (!selectedSkillId) {
            setError(t("errors.selectSkill"))
            return
        }

        if (!mastery) {
            setError(t("errors.selectMastery"))
            return
        }

        const selectedSkill = availableSkills.find(
            (s) => String(s.id) === String(selectedSkillId),
        )

        if (!selectedSkill) {
            setError(t("errors.notFound"))
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await addCvSkills({
                cvId: cvId,
                name: selectedSkill.name,
                categoryId: selectedSkill.categoryId || null,
                mastery: mastery as Mastery,
            })

            router.refresh()
            handleClose()
        } catch (err: unknown) {
            const error = err as Error
            console.error("Failed to add skill:", error)

            const errorMessage = error.message || String(err)
            if (errorMessage.includes("skillHasBeenAdded")) {
                setError(t("errors.alreadyAdded"))
            } else {
                setError(t("errors.failed"))
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        isOpen,
        t,
        selectedSkillId,
        setSelectedSkillId: (id: string | null) => {
            setSelectedSkillId(id ?? "")
            setError(null)
        },
        mastery,
        setMastery: (m: Mastery | "") => {
            setMastery(m)
            setError(null)
        },
        error,
        isSubmitting,
        unselectedSkills,
        availableSkills,
        isValid: Boolean(selectedSkillId && mastery),
        handleClose,
        handleSubmit,
    }
}
