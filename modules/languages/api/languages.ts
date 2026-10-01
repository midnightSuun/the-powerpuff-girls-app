"use server"

import { revalidatePath } from "next/cache"

import { getGql } from "@/gql"
import {
    AddProfileLanguageDocument,
    AddProfileLanguageInput,
    DeleteProfileLanguageDocument,
    DeleteProfileLanguageInput,
    GetLanguagesDocument,
    GetProfileLanguagesDocument,
    UpdateProfileLanguageDocument,
    UpdateProfileLanguageInput,
} from "@/gql/generated/graphql"

export async function getUserLanguages(userId: string) {
    if (!userId) {
        return { languages: [] }
    }

    const gql = await getGql()
    const data = await gql.request(GetProfileLanguagesDocument, {
        userId,
    })

    const profileLanguages = data.profile?.languages ?? []

    return {
        languages: profileLanguages,
    }
}

export async function getAvailableLanguages() {
    const gql = await getGql()
    const data = await gql.request(GetLanguagesDocument, {
        params: { limit: 100 },
    })

    return (data.languages?.items ?? []).map((lang) => ({
        id: lang.id,
        name: lang.name,
        iso2: lang.iso2,
    }))
}

export async function addProfileLanguage(language: AddProfileLanguageInput) {
    const gql = await getGql()
    const data = await gql.request(AddProfileLanguageDocument, { language })

    revalidatePath("/languages")
    return data
}

export async function updateProfileLanguage(
    language: UpdateProfileLanguageInput,
) {
    const gql = await getGql()
    const data = await gql.request(UpdateProfileLanguageDocument, { language })

    revalidatePath("/languages")
    return data
}

export async function deleteProfileLanguages(
    language: DeleteProfileLanguageInput,
) {
    const gql = await getGql()
    const data = await gql.request(DeleteProfileLanguageDocument, { language })

    revalidatePath("/languages")
    return data
}
