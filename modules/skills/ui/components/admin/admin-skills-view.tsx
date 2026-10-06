"use client"

import { useTranslations } from "next-intl"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"
import { useAdminSkillsView } from "@/modules/skills/hooks/use-admin-skills-view"

import { type CategoryOption, CreateSkillModal } from "./create-skill-modal"
import { DeleteSkillModal } from "./delete-skill-admin-modal"
import { type AdminSkillItem, EditSkillModal } from "./edit-skill-admin-modal"

interface AdminSkillsViewProps {
    initialSkills: AdminSkillItem[]
    categories: CategoryOption[]
}

export function AdminSkillsView({
    initialSkills,
    categories,
}: AdminSkillsViewProps) {
    const tAdmin = useTranslations("Skills.admin")
    const tSkills = useTranslations("Skills")

    const {
        skills,
        isCreateOpen,
        setIsCreateOpen,
        editingSkill,
        setEditingSkill,
        deletingSkill,
        setDeletingSkill,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    } = useAdminSkillsView({ initialSkills })

    const formattedSkills = skills.map((skill) => {
        const catId = skill.categoryId || skill.category
        return {
            ...skill,
            category: tSkills(`categories.${catId}`, {
                defaultValue: skill.category,
            }),
        }
    })

    const columns: Column<AdminSkillItem>[] = [
        { key: "name", label: tAdmin("name"), sortable: true },
        { key: "category", label: tAdmin("category") },
    ]

    return (
        <div className="w-full">
            <AdminDataTable
                data={formattedSkills}
                columns={columns}
                searchPlaceholder={tAdmin("search")}
                createButtonLabel={tAdmin("create")}
                onCreateClick={() => setIsCreateOpen(true)}
                createButtonClassName="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                onEditClick={(skill) => setEditingSkill(skill)}
                onDeleteClick={(skill) => setDeletingSkill(skill)}
                getSearchableString={(skill) => skill.name}
                getSortValue={(skill) => skill.name}
                emptyMessage={tAdmin("empty")}
            />

            <CreateSkillModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                categories={categories}
                existingSkillNames={skills.map((s) => s.name)}
                onCreate={handleCreate}
            />

            <EditSkillModal
                isOpen={Boolean(editingSkill)}
                onClose={() => setEditingSkill(null)}
                skill={editingSkill}
                categories={categories}
                onUpdate={handleUpdate}
            />

            <DeleteSkillModal
                isOpen={Boolean(deletingSkill)}
                onClose={() => setDeletingSkill(null)}
                skillName={deletingSkill?.name ?? ""}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
