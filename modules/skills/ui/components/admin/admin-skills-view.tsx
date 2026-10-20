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
    search?: string
}

export function AdminSkillsView({
    initialSkills,
    categories,
    search = "",
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
        const translatedCat = tSkills(`categories.${catId}`, {
            defaultValue: skill.category,
        })

        const skillType = skill.type || skill.category || "General"

        return {
            ...skill,
            type: skillType,
            category: translatedCat,
        }
    })

    const columns: Column<AdminSkillItem>[] = [
        { key: "name", label: tAdmin("name"), sortable: true },
        {
            key: "type",
            label: "Type",
            sortable: true,
            className: "hidden lg:table-cell",
        },
        { key: "category", label: tAdmin("category"), sortable: true },
    ]

    return (
        <div className="w-full">
            <AdminDataTable
                data={formattedSkills}
                columns={columns}
                defaultSortKey="type"
                search={search}
                showSearchInput={false}
                searchPlaceholder={tAdmin("search")}
                createButtonLabel={tAdmin("create")}
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(skill) => setEditingSkill(skill)}
                onDeleteClick={(skill) => setDeletingSkill(skill)}
                getSearchableString={(skill) =>
                    `${skill.name} ${skill.type ?? ""} ${skill.category}`
                }
                getSortValue={(skill, key) => {
                    if (key === "type") return skill.type ?? ""
                    if (key === "category") return skill.category ?? ""
                    return skill.name
                }}
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
