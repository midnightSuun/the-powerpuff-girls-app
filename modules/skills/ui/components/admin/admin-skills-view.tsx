"use client"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"
import { useAdminSkillsView } from "@/modules/skills/hooks/use-admin-skills-view"

import { type CategoryOption, CreateSkillModal } from "./create-skill-modal"
import { DeleteSkillModal } from "./delete-skill-admin-modal"
import { type AdminSkillItem, EditSkillModal } from "./edit-skill-admin-modal"

interface AdminSkillsViewProps {
    initialSkills: AdminSkillItem[]
    categories: CategoryOption[]
}

const SKILL_COLUMNS: Column<AdminSkillItem>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "category", label: "Category" },
]

export function AdminSkillsView({
    initialSkills,
    categories,
}: AdminSkillsViewProps) {
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

    return (
        <div className="w-full">
            <AdminDataTable
                data={skills}
                columns={SKILL_COLUMNS}
                searchPlaceholder="Search"
                createButtonLabel="CREATE SKILL"
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(skill) => setEditingSkill(skill)}
                onDeleteClick={(skill) => setDeletingSkill(skill)}
                getSearchableString={(skill) => skill.name}
                getSortValue={(skill) => skill.name}
                emptyMessage="No skills found"
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
