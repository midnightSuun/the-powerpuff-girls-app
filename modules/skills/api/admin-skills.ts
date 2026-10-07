"use server"

import { revalidatePath } from "next/cache"

import { getGql } from "@/gql"
import {
    CreateSkillDocument,
    CreateSkillInput,
    DeleteSkillDocument,
    DeleteSkillInput,
    GetAdminSkillsDocument,
    GetSkillCategoriesDocument,
    UpdateAdminSkillDocument,
    UpdateSkillInput,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

export async function getAdminSkills() {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(GetAdminSkillsDocument)

    return (data.skills?.items ?? []).map((skill) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category?.name ?? "Uncategorized",
        categoryId: skill.category?.id ?? "",
    }))
}

export async function getSkillCategories() {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(GetSkillCategoriesDocument)

    return (data.skillCategories ?? []).map((cat) => ({
        id: cat.id,
        name: cat.name,
    }))
}

export async function createAdminSkill(skill: CreateSkillInput) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(CreateSkillDocument, { skill })

    revalidatePath("/skills")
    return data.createSkill
}

export async function updateAdminSkill(skill: UpdateSkillInput) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(UpdateAdminSkillDocument, { skill })

    revalidatePath("/skills")
    return data.updateSkill
}

export async function deleteAdminSkill(skill: DeleteSkillInput) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(DeleteSkillDocument, { skill })

    revalidatePath("/skills")
    return data.deleteSkill
}
