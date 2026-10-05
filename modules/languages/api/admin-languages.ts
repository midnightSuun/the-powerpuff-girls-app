"use server"

import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"

import { getGql } from "@/gql"
import {
    CreateLanguageDocument,
    CreateLanguageInput,
    DeleteLanguageDocument,
    DeleteLanguageInput,
    GetLanguagesDocument,
    UpdateLanguageDocument,
    UpdateLanguageInput,
} from "@/gql/generated/graphql"

export async function getAdminLanguages() {
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

export async function createAdminLanguage(language: CreateLanguageInput) {
    try {
        const gql = await getGql()
        const data = await gql.request(CreateLanguageDocument, { language })

        revalidatePath("/languages")
        return data.createLanguage
    } catch (err: unknown) {
        console.error("Failed to create language:", err)
        const t = await getTranslations("Languages.admin.errors")
        throw new Error(t("invalidData"))
    }
}

export async function updateAdminLanguage(language: UpdateLanguageInput) {
    const gql = await getGql()
    const data = await gql.request(UpdateLanguageDocument, { language })

    revalidatePath("/languages")
    return data.updateLanguage
}

export async function deleteAdminLanguage(language: DeleteLanguageInput) {
    const gql = await getGql()
    const data = await gql.request(DeleteLanguageDocument, { language })

    revalidatePath("/languages")
    return data.deleteLanguage
}
