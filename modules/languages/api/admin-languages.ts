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
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

export async function getAdminLanguages() {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(GetLanguagesDocument, {
        params: { limit: 100 },
    })

    return (data.languages?.items ?? []).map((lang) => ({
        id: lang.id,
        name: lang.name,
        iso2: lang.iso2,
        nativeName: (lang as { native_name?: string }).native_name ?? "",
    }))
}

export async function createAdminLanguage(data: {
    name: string
    iso2: string
    nativeName?: string
}) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const language: CreateLanguageInput = {
            name: data.name,
            iso2: data.iso2,
            native_name: data.nativeName,
        }
        const resData = await gql.request(CreateLanguageDocument, { language })

        revalidatePath("/languages")
        return resData.createLanguage
    } catch (err: unknown) {
        console.error("Failed to create language:", err)
        const t = await getTranslations("Languages.admin.errors")
        throw new Error(t("createFailed"))
    }
}

export async function updateAdminLanguage(data: {
    id: string
    name: string
    iso2: string
    nativeName?: string
}) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const language: UpdateLanguageInput = {
            languageId: data.id, // <--- Передаём id в поле languageId
            name: data.name,
            iso2: data.iso2,
            native_name: data.nativeName,
        }
        const resData = await gql.request(UpdateLanguageDocument, { language })

        revalidatePath("/languages")
        return resData.updateLanguage
    } catch (error) {
        console.error("Failed to update language:", error)
        const t = await getTranslations("Languages.admin.errors")
        throw new Error(t("updateFailed"))
    }
}

export async function deleteAdminLanguage(language: DeleteLanguageInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(DeleteLanguageDocument, { language })

        revalidatePath("/languages")
        return data.deleteLanguage
    } catch (error) {
        console.error("Failed to delete language:", error)
        const t = await getTranslations("Languages.delete.errors")
        throw new Error(t("failed"))
    }
}
