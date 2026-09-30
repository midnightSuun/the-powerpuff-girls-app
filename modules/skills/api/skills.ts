"use server"

import { revalidatePath } from "next/cache"

import { getGql } from "@/gql"
import {
    AddCvSkillInput,
    AddSkillDocument,
    CreateCvDocument,
    DeleteCvSkillDocument,
    DeleteCvSkillInput,
    GetSkillsDocument,
    GetUserSkillsDocument,
} from "@/gql/generated/graphql"

export async function getUserSkills(userId: string) {
    if (!userId) {
        return { cvId: "", skills: [] }
    }

    const gql = await getGql()
    const data = await gql.request(GetUserSkillsDocument, {
        userId,
    })

    let cvId = data.user?.cvs?.[0]?.id ?? ""

    if (!cvId) {
        try {
            const newCvData = await gql.request(CreateCvDocument, {
                cv: {
                    name: "Main CV",
                    description: "Auto-generated primary CV",
                    userId: userId,
                },
            })
            cvId = newCvData.createCv.id
        } catch (err) {
            console.error("Failed to auto-create CV:", err)
        }
    }

    const cvSkills = data.user?.cvs?.[0]?.skills ?? []

    return {
        cvId,
        skills: cvSkills,
    }
}

export async function getAvailableSkills() {
    const gql = await getGql()
    const data = await gql.request(GetSkillsDocument)

    return (data.skills?.items ?? []).map((skill) => ({
        id: skill.id,
        name: skill.name,
        categoryId: skill.category?.id ?? "",
    }))
}

export async function addCvSkills(skill: AddCvSkillInput) {
    const gql = await getGql()
    const data = await gql.request(AddSkillDocument, { skill })

    revalidatePath("/skills")
    return data
}

export async function deleteCvSkills(skill: DeleteCvSkillInput) {
    const gql = await getGql()
    const data = await gql.request(DeleteCvSkillDocument, { skill })

    revalidatePath("/skills")
    return data
}
