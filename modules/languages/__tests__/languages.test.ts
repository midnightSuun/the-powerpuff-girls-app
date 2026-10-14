import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import {
    AddProfileLanguageDocument,
    DeleteProfileLanguageDocument,
    GetLanguagesDocument,
    GetProfileLanguagesDocument,
    UpdateProfileLanguageDocument,
} from "@/gql/generated/graphql"

import {
    addProfileLanguage,
    deleteProfileLanguages,
    getAvailableLanguages,
    getUserLanguages,
    updateProfileLanguage,
} from "../api/languages"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn(),
}))

describe("Profile Languages Actions", () => {
    const mockGqlClient = {
        request: vi.fn(),
    }

    const mockT = vi.fn((key: string) => key)

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.mocked(getGql).mockResolvedValue(
            mockGqlClient as unknown as Awaited<ReturnType<typeof getGql>>,
        )
        vi.mocked(getTranslations).mockResolvedValue(
            mockT as unknown as Awaited<ReturnType<typeof getTranslations>>,
        )
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("getUserLanguages", () => {
        it("returns empty languages array when userId is empty", async () => {
            const result = await getUserLanguages("")
            expect(result).toEqual({ languages: [] })
            expect(mockGqlClient.request).not.toHaveBeenCalled()
        })

        it("fetches and returns profile languages successfully", async () => {
            const mockLanguages = [
                { id: "pl-1", language: { name: "English" } },
            ]
            mockGqlClient.request.mockResolvedValueOnce({
                profile: { languages: mockLanguages },
            })

            const result = await getUserLanguages("user-1")

            expect(mockGqlClient.request).toHaveBeenCalledWith(
                GetProfileLanguagesDocument,
                { userId: "user-1" },
            )
            expect(result).toEqual({ languages: mockLanguages })
        })

        it("returns empty array if profile or languages are missing", async () => {
            mockGqlClient.request.mockResolvedValueOnce({ profile: null })

            const result = await getUserLanguages("user-1")

            expect(result).toEqual({ languages: [] })
        })
    })

    describe("getAvailableLanguages", () => {
        it("fetches and maps available languages correctly", async () => {
            mockGqlClient.request.mockResolvedValueOnce({
                languages: {
                    items: [
                        { id: "lang-1", name: "English", iso2: "en" },
                        { id: "lang-2", name: "Spanish", iso2: "es" },
                    ],
                },
            })

            const result = await getAvailableLanguages()

            expect(mockGqlClient.request).toHaveBeenCalledWith(
                GetLanguagesDocument,
                { params: { limit: 100 } },
            )
            expect(result).toEqual([
                { id: "lang-1", name: "English", iso2: "en" },
                { id: "lang-2", name: "Spanish", iso2: "es" },
            ])
        })

        it("returns empty array when available language items are null", async () => {
            mockGqlClient.request.mockResolvedValueOnce({
                languages: { items: null },
            })

            const result = await getAvailableLanguages()

            expect(result).toEqual([])
        })
    })

    describe("addProfileLanguage", () => {
        it("adds profile language successfully and revalidates path", async () => {
            const input: Parameters<typeof addProfileLanguage>[0] =
                {} as Parameters<typeof addProfileLanguage>[0]

            const mockResponse = { success: true }
            mockGqlClient.request.mockResolvedValueOnce(mockResponse)

            const result = await addProfileLanguage(input)

            expect(mockGqlClient.request).toHaveBeenCalledWith(
                AddProfileLanguageDocument,
                { language: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/languages")
            expect(result).toEqual(mockResponse)
        })

        it("throws localized error when adding fails", async () => {
            const input = {} as Parameters<typeof addProfileLanguage>[0]
            mockGqlClient.request.mockRejectedValueOnce(new Error("Error"))

            await expect(addProfileLanguage(input)).rejects.toThrow("failed")
            expect(getTranslations).toHaveBeenCalledWith("Languages.add.errors")
        })
    })

    describe("updateProfileLanguage", () => {
        it("updates profile language successfully and revalidates path", async () => {
            const input = {} as Parameters<typeof updateProfileLanguage>[0]
            const mockResponse = { success: true }
            mockGqlClient.request.mockResolvedValueOnce(mockResponse)

            const result = await updateProfileLanguage(input)

            expect(mockGqlClient.request).toHaveBeenCalledWith(
                UpdateProfileLanguageDocument,
                { language: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/languages")
            expect(result).toEqual(mockResponse)
        })

        it("throws localized error when updating fails", async () => {
            const input = {} as Parameters<typeof updateProfileLanguage>[0]
            mockGqlClient.request.mockRejectedValueOnce(new Error("Error"))

            await expect(updateProfileLanguage(input)).rejects.toThrow("failed")
            expect(getTranslations).toHaveBeenCalledWith(
                "Languages.edit.errors",
            )
        })
    })

    describe("deleteProfileLanguages", () => {
        it("deletes profile language successfully and revalidates path", async () => {
            const input = {} as Parameters<typeof deleteProfileLanguages>[0]
            const mockResponse = { success: true }
            mockGqlClient.request.mockResolvedValueOnce(mockResponse)

            const result = await deleteProfileLanguages(input)

            expect(mockGqlClient.request).toHaveBeenCalledWith(
                DeleteProfileLanguageDocument,
                { language: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/languages")
            expect(result).toEqual(mockResponse)
        })

        it("throws localized error when deletion fails", async () => {
            const input = {} as Parameters<typeof deleteProfileLanguages>[0]
            mockGqlClient.request.mockRejectedValueOnce(new Error("Error"))

            await expect(deleteProfileLanguages(input)).rejects.toThrow(
                "failed",
            )
            expect(getTranslations).toHaveBeenCalledWith(
                "Languages.delete.errors",
            )
        })
    })
})
