import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import {
    CreateLanguageDocument,
    DeleteLanguageDocument,
    GetLanguagesDocument,
    UpdateLanguageDocument,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

import {
    createAdminLanguage,
    deleteAdminLanguage,
    getAdminLanguages,
    updateAdminLanguage,
} from "../api/admin-languages"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

vi.mock("@/modules/auth/helpers/require-admin", () => ({
    requireAdmin: vi.fn(),
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn(),
}))

describe("Admin Languages Actions", () => {
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

    describe("getAdminLanguages", () => {
        it("checks admin rights and returns mapped languages successfully", async () => {
            mockGqlClient.request.mockResolvedValueOnce({
                languages: {
                    items: [
                        {
                            id: "lang-1",
                            name: "English",
                            iso2: "en",
                            native_name: "English",
                        },
                        {
                            id: "lang-2",
                            name: "Russian",
                            iso2: "ru",
                            native_name: "Русский",
                        },
                    ],
                },
            })

            const result = await getAdminLanguages()

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                GetLanguagesDocument,
                { params: { limit: 100 } },
            )
            expect(result).toEqual([
                {
                    id: "lang-1",
                    name: "English",
                    iso2: "en",
                    nativeName: "English",
                },
                {
                    id: "lang-2",
                    name: "Russian",
                    iso2: "ru",
                    nativeName: "Русский",
                },
            ])
        })

        it("returns an empty array when language items are missing", async () => {
            mockGqlClient.request.mockResolvedValueOnce({
                languages: { items: null },
            })

            const result = await getAdminLanguages()

            expect(result).toEqual([])
        })
    })

    describe("createAdminLanguage", () => {
        it("checks admin rights, executes mutation, and revalidates path", async () => {
            const input = {
                name: "Polish",
                iso2: "pl",
                nativeName: "Polski",
            }
            const mockResponse = { id: "lang-3", ...input }

            mockGqlClient.request.mockResolvedValueOnce({
                createLanguage: mockResponse,
            })

            const result = await createAdminLanguage(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                CreateLanguageDocument,
                {
                    language: {
                        name: input.name,
                        iso2: input.iso2,
                        native_name: input.nativeName,
                    },
                },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/languages")
            expect(result).toEqual(mockResponse)
        })

        it("throws a localized error when mutation fails", async () => {
            const input = { name: "Polish", iso2: "pl" }
            mockGqlClient.request.mockRejectedValueOnce(
                new Error("GraphQL Error"),
            )

            await expect(createAdminLanguage(input)).rejects.toThrow(
                "createFailed",
            )
            expect(getTranslations).toHaveBeenCalledWith(
                "Languages.admin.errors",
            )
        })
    })

    describe("updateAdminLanguage", () => {
        it("checks admin rights, updates language, and revalidates path", async () => {
            const input = {
                id: "lang-1",
                name: "Updated English",
                iso2: "en",
                nativeName: "English",
            }
            const mockResponse = { ...input }

            mockGqlClient.request.mockResolvedValueOnce({
                updateLanguage: mockResponse,
            })

            const result = await updateAdminLanguage(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                UpdateLanguageDocument,
                {
                    language: {
                        languageId: input.id,
                        name: input.name,
                        iso2: input.iso2,
                        native_name: input.nativeName,
                    },
                },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/languages")
            expect(result).toEqual(mockResponse)
        })

        it("throws a localized error when update mutation fails", async () => {
            const input = { id: "lang-1", name: "Error", iso2: "er" }
            mockGqlClient.request.mockRejectedValueOnce(new Error("DB Error"))

            await expect(updateAdminLanguage(input)).rejects.toThrow(
                "updateFailed",
            )
            expect(getTranslations).toHaveBeenCalledWith(
                "Languages.admin.errors",
            )
        })
    })

    describe("deleteAdminLanguage", () => {
        it("checks admin rights, deletes language, and revalidates path", async () => {
            const input: Parameters<typeof deleteAdminLanguage>[0] = {
                languageId: "lang-1",
            }
            const mockResponse = { success: true }

            mockGqlClient.request.mockResolvedValueOnce({
                deleteLanguage: mockResponse,
            })

            const result = await deleteAdminLanguage(input)

            expect(requireAdmin).toHaveBeenCalledTimes(1)
            expect(mockGqlClient.request).toHaveBeenCalledWith(
                DeleteLanguageDocument,
                { language: input },
            )
            expect(revalidatePath).toHaveBeenCalledWith("/languages")
            expect(result).toEqual(mockResponse)
        })

        it("throws a localized error when deletion fails", async () => {
            const input: Parameters<typeof deleteAdminLanguage>[0] = {
                languageId: "lang-1",
            }
            mockGqlClient.request.mockRejectedValueOnce(
                new Error("Constraint violation"),
            )

            await expect(deleteAdminLanguage(input)).rejects.toThrow("failed")
            expect(getTranslations).toHaveBeenCalledWith(
                "Languages.delete.errors",
            )
        })
    })
})
