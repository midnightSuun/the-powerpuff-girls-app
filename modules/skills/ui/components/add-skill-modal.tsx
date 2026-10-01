"use client"

import { useTranslations } from "next-intl"

import { AddItemModal } from "@/components/ui/add-item-modal"

import {
    type SkillOption,
    useAddSkillModal,
    type UserSkill,
} from "../../hooks/use-add-skill-modal"
import { SkillMasterySelect } from "./skill-mastery-select"

interface AddSkillModalProps {
    isOpen: boolean
    onClose: () => void
    cvId: string
    existingSkills?: UserSkill[]
    availableSkills?: SkillOption[]
}
export function AddSkillModal(props: AddSkillModalProps) {
    const t = useTranslations("Skills.add")
    const modalT = useTranslations("Skills.edit")

    const {
        isOpen,
        selectedSkillId,
        setSelectedSkillId,
        mastery,
        setMastery,
        error,
        isSubmitting,
        unselectedSkills,
        isValid,
        handleClose,
        handleSubmit,
    } = useAddSkillModal(props)

    return (
        <AddItemModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("title")}
            skillPlaceholder={t("skillPlaceholder")}
            allSkillsAddedText={t("allSkillsAdded")}
            addingText={t("adding")}
            submitText={t("submit")}
            cancelText={t("cancel")}
            error={error}
            isSubmitting={isSubmitting}
            isValid={isValid}
            selectedId={selectedSkillId}
            onSelectChange={(val) => setSelectedSkillId(val ?? "")}
            availableOptions={unselectedSkills}
            onSubmit={handleSubmit}
            proficiencySelectNode={
                <SkillMasterySelect
                    value={mastery}
                    onValueChange={setMastery}
                />
            }
        />
    )
}
