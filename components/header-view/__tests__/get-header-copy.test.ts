import { getHeaderCopy } from "../get-header-copy"

vi.mock("next-intl/server", () => ({
    getTranslations: vi.fn((namespace: string) => {
        const translations: Record<string, Record<string, string>> = {
            Users: {
                title: "Users",
            },
            Skills: {
                title: "Skills",
            },
            Languages: {
                title: "Languages",
            },
            Settings: {
                title: "Settings",
            },
            "Admin.departments": {
                title: "Departments",
            },
            "Admin.positions": {
                title: "Positions",
            },
            "Admin.projects": {
                title: "Projects",
            },
            "User.nav": {
                profile: "Profile",
            },
            Cvs: {
                title: "CVs",
            },
            CV: {
                "tabs.details": "Details",
                "tabs.skills": "Skills",
                "tabs.projects": "Projects",
                "tabs.preview": "Preview",
            },
            Common: {
                breadcrumb: "Breadcrumb",
            },
        }

        return Promise.resolve((key: string) => {
            const namespaceTranslations = translations[namespace]
            return namespaceTranslations?.[key] ?? key
        })
    }),
}))

describe("getHeaderCopy", () => {
    it("returns copy object with all required keys", async () => {
        const result = await getHeaderCopy()

        expect(result.copy).toHaveProperty("users")
        expect(result.copy).toHaveProperty("skills")
        expect(result.copy).toHaveProperty("languages")
        expect(result.copy).toHaveProperty("settings")
        expect(result.copy).toHaveProperty("departments")
        expect(result.copy).toHaveProperty("positions")
        expect(result.copy).toHaveProperty("projects")
        expect(result.copy).toHaveProperty("profile")
        expect(result.copy).toHaveProperty("cvs")
        expect(result.copy).toHaveProperty("cvDetails")
        expect(result.copy).toHaveProperty("cvSkills")
        expect(result.copy).toHaveProperty("cvProjects")
        expect(result.copy).toHaveProperty("cvPreview")
    })

    it("returns translated values for all keys", async () => {
        const result = await getHeaderCopy()

        expect(result.copy.users).toBe("Users")
        expect(result.copy.skills).toBe("Skills")
        expect(result.copy.languages).toBe("Languages")
        expect(result.copy.settings).toBe("Settings")
        expect(result.copy.departments).toBe("Departments")
        expect(result.copy.positions).toBe("Positions")
        expect(result.copy.projects).toBe("Projects")
        expect(result.copy.profile).toBe("Profile")
        expect(result.copy.cvs).toBe("CVs")
    })

    it("lowercases CV tab translations", async () => {
        const result = await getHeaderCopy()

        expect(result.copy.cvDetails).toBe("details")
        expect(result.copy.cvSkills).toBe("skills")
        expect(result.copy.cvProjects).toBe("projects")
        expect(result.copy.cvPreview).toBe("preview")
    })

    it("returns breadcrumbLabel", async () => {
        const result = await getHeaderCopy()

        expect(result.breadcrumbLabel).toBe("Breadcrumb")
    })

    it("returns object with copy and breadcrumbLabel properties", async () => {
        const result = await getHeaderCopy()

        expect(result).toHaveProperty("copy")
        expect(result).toHaveProperty("breadcrumbLabel")
    })

    it("copy object has correct number of properties", async () => {
        const result = await getHeaderCopy()

        expect(Object.keys(result.copy)).toHaveLength(13)
    })
})
