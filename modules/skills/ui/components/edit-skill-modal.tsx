"use client"

import { useTranslations } from "next-intl"

import { EditItemModal } from "@/components/ui/edit-item-modal"
import type { Mastery } from "@/gql/generated/graphql"

import { useEditSkillModal } from "../../hooks/use-edit-skill-modal"
import { SkillMasterySelect } from "./skill-mastery-select"

interface EditSkillModalProps {
    isOpen: boolean
    onClose: () => void
    skillName: string
    currentMastery: Mastery | string | number
    onUpdate: (mastery: Mastery) => Promise<void>
}

export function EditSkillModal(props: EditSkillModalProps) {
    const { isOpen, skillName } = props
    const t = useTranslations("Skills.edit")

    const {
        mastery,
        setMastery,
        error,
        isSubmitting,
        isValid,
        handleClose,
        handleSubmit,
    } = useEditSkillModal(props)

    return (
        <EditItemModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("title")}
            itemNameLabel={t("skill")}
            itemNameValue={skillName}
            levelSelectLabel={t("mastery")}
            cancelText={t("cancel")}
            submitText={t("submit")}
            updatingText={t("updating")}
            error={error}
            isSubmitting={isSubmitting}
            isValid={isValid}
            levelSelectNode={
                <SkillMasterySelect
                    value={mastery}
                    onValueChange={(value) => setMastery(value)}
                />
            }
            onSubmit={handleSubmit}
        />
    )
}
