import {
    fillPath,
    getVisibleTabs,
    joinPaths,
    matchTemplate,
    normalizePathname,
    parentPath,
    resolvePage,
} from "../resolve-page"
import type { HeaderPage, HeaderTabsPage } from "../types"

vi.mock("@/i18n/routing", () => ({
    routing: {
        locales: ["en", "uk", "ru"],
    },
}))

describe("matchTemplate", () => {
    it("matches simple path without parameters", () => {
        const result = matchTemplate("/users", "/users")

        expect(result).toEqual({
            params: {},
            remainder: "",
        })
    })

    it("matches path with single parameter", () => {
        const result = matchTemplate("/users/{id}", "/users/123")

        expect(result).toEqual({
            params: { id: "123" },
            remainder: "",
        })
    })

    it("matches path with multiple parameters", () => {
        const result = matchTemplate(
            "/users/{userId}/posts/{postId}",
            "/users/123/posts/456",
        )

        expect(result).toEqual({
            params: { userId: "123", postId: "456" },
            remainder: "",
        })
    })

    it("returns remainder for extra path segments", () => {
        const result = matchTemplate("/users/{id}", "/users/123/settings")

        expect(result).toEqual({
            params: { id: "123" },
            remainder: "/settings",
        })
    })

    it("returns null when path does not match template", () => {
        const result = matchTemplate("/users", "/posts")

        expect(result).toBeNull()
    })

    it("returns null when path is shorter than template", () => {
        const result = matchTemplate("/users/{id}", "/users")

        expect(result).toBeNull()
    })

    it("decodes URL-encoded parameter values", () => {
        const result = matchTemplate("/users/{name}", "/users/John%20Doe")

        expect(result).toEqual({
            params: { name: "John Doe" },
            remainder: "",
        })
    })

    it("handles invalid URL encoding gracefully", () => {
        const result = matchTemplate("/users/{name}", "/users/Invalid%")

        expect(result).toEqual({
            params: { name: "Invalid%" },
            remainder: "",
        })
    })

    it("handles empty path segments", () => {
        const result = matchTemplate("/users//profile", "/users//profile")

        expect(result).toEqual({
            params: {},
            remainder: "",
        })
    })
})

describe("fillPath", () => {
    it("fills single parameter", () => {
        const result = fillPath("/users/{id}", { id: "123" })

        expect(result).toBe("/users/123")
    })

    it("fills multiple parameters", () => {
        const result = fillPath("/users/{userId}/posts/{postId}", {
            userId: "123",
            postId: "456",
        })

        expect(result).toBe("/users/123/posts/456")
    })

    it("encodes parameter values", () => {
        const result = fillPath("/users/{name}", { name: "John Doe" })

        expect(result).toBe("/users/John%20Doe")
    })

    it("handles missing parameters", () => {
        const result = fillPath("/users/{id}", {})

        expect(result).toBe("/users/")
    })

    it("handles special characters in parameters", () => {
        const result = fillPath("/users/{query}", { query: "a&b=c" })

        expect(result).toBe("/users/a%26b%3Dc")
    })
})

describe("parentPath", () => {
    it("returns parent path for single-level template", () => {
        const result = parentPath("/users")

        expect(result).toBe("/users")
    })

    it("returns parent path for template with parameter", () => {
        const result = parentPath("/users/{id}")

        expect(result).toBe("/users")
    })

    it("returns parent path for nested template", () => {
        const result = parentPath("/users/{userId}/posts/{postId}")

        expect(result).toBe("/users/posts")
    })

    it("returns root for template with only parameter", () => {
        const result = parentPath("/{id}")

        expect(result).toBe("/")
    })

    it("handles template with multiple parameters", () => {
        const result = parentPath("/profile/{userId}/cv/{cvId}")

        expect(result).toBe("/profile/cv")
    })
})

describe("joinPaths", () => {
    it("joins base path with tab path", () => {
        const result = joinPaths("/users/123", "/settings")

        expect(result).toBe("/users/123/settings")
    })

    it("handles base path with trailing slash", () => {
        const result = joinPaths("/users/123/", "/settings")

        expect(result).toBe("/users/123/settings")
    })

    it("handles tab path without leading slash", () => {
        const result = joinPaths("/users/123", "settings")

        expect(result).toBe("/users/123/settings")
    })

    it("handles empty tab path", () => {
        const result = joinPaths("/users/123", "")

        expect(result).toBe("/users/123/")
    })

    it("joins multiple segments correctly", () => {
        const result = joinPaths("/users/123", "/posts/456")

        expect(result).toBe("/users/123/posts/456")
    })
})

describe("normalizePathname", () => {
    it("returns pathname as-is when no locale prefix", () => {
        const result = normalizePathname("/users")

        expect(result).toBe("/users")
    })

    it("removes locale prefix for supported locale", () => {
        const result = normalizePathname("/en/users")

        expect(result).toBe("/users")
    })

    it("removes different locale prefix", () => {
        const result = normalizePathname("/uk/users")

        expect(result).toBe("/users")
    })

    it("does not remove unsupported locale prefix", () => {
        const result = normalizePathname("/fr/users")

        expect(result).toBe("/fr/users")
    })

    it("removes query string", () => {
        const result = normalizePathname("/users?search=john")

        expect(result).toBe("/users")
    })

    it("removes hash fragment", () => {
        const result = normalizePathname("/users#section")

        expect(result).toBe("/users")
    })

    it("handles locale with query and hash", () => {
        const result = normalizePathname("/en/users?search=john#section")

        expect(result).toBe("/users")
    })

    it("handles root path", () => {
        const result = normalizePathname("/")

        expect(result).toBe("/")
    })

    it("handles empty path segments", () => {
        const result = normalizePathname("//users//profile")

        expect(result).toBe("/users/profile")
    })
})

describe("getVisibleTabs", () => {
    const basePage: HeaderTabsPage = {
        type: "tabs",
        path: "/profile/{userId}",
        firstBreadcrumb: "users",
        breadcrumbParam: "userId",
        showBreadcrumbIcon: true,
        tabs: [
            { label: "profile", path: "" },
            { label: "cvs", path: "/cvs" },
            {
                label: "settings",
                path: "/settings",
                requiresUserAdminOrOwner: true,
            },
        ],
    }

    it("returns all tabs when user is admin", () => {
        const result = getVisibleTabs(
            basePage,
            { params: { userId: "123" }, remainder: "" },
            "456",
            true,
        )

        expect(result).toHaveLength(3)
    })

    it("returns all tabs when user is owner", () => {
        const result = getVisibleTabs(
            basePage,
            { params: { userId: "123" }, remainder: "" },
            "123",
            false,
        )

        expect(result).toHaveLength(3)
    })

    it("filters restricted tabs for non-owner non-admin", () => {
        const result = getVisibleTabs(
            basePage,
            { params: { userId: "123" }, remainder: "" },
            "456",
            false,
        )

        expect(result).toHaveLength(2)
        expect(result.find((t) => t.label === "settings")).toBeUndefined()
    })

    it("returns all tabs when no restrictions exist", () => {
        const pageNoRestrictions: HeaderTabsPage = {
            ...basePage,
            tabs: [
                { label: "profile", path: "" },
                { label: "cvs", path: "/cvs" },
            ],
        }

        const result = getVisibleTabs(
            pageNoRestrictions,
            { params: { userId: "123" }, remainder: "" },
            null,
            false,
        )

        expect(result).toHaveLength(2)
    })

    it("handles null viewerId correctly", () => {
        const result = getVisibleTabs(
            basePage,
            { params: { userId: "123" }, remainder: "" },
            null,
            false,
        )

        expect(result).toHaveLength(2)
    })
})

describe("resolvePage", () => {
    const mockPages: HeaderPage[] = [
        {
            type: "default",
            path: "/users",
            title: "users",
        },
        {
            type: "default",
            path: "/skills",
            title: "skills",
        },
        {
            type: "tabs",
            path: "/profile/{userId}",
            firstBreadcrumb: "users",
            breadcrumbParam: "userId",
            showBreadcrumbIcon: true,
            tabs: [
                { label: "profile", path: "" },
                { label: "cvs", path: "/cvs" },
            ],
        },
    ]

    it("resolves default page", () => {
        const result = resolvePage(mockPages, "/users", null, false)

        expect(result).not.toBeNull()
        expect(result?.page.type).toBe("default")
        expect((result?.page as any).title).toBe("users")
    })

    it("resolves tabs page with base path", () => {
        const result = resolvePage(mockPages, "/profile/123", null, false)

        expect(result).not.toBeNull()
        expect(result?.page.type).toBe("tabs")
        expect(result?.match.params.userId).toBe("123")
        expect(result?.match.remainder).toBe("")
    })

    it("resolves tabs page with tab path", () => {
        const result = resolvePage(mockPages, "/profile/123/cvs", null, false)

        expect(result).not.toBeNull()
        expect(result?.page.type).toBe("tabs")
        expect(result?.match.remainder).toBe("/cvs")
    })

    it("returns null for unknown path", () => {
        const result = resolvePage(mockPages, "/unknown", null, false)

        expect(result).toBeNull()
    })

    it("returns null for default page with extra segments", () => {
        const result = resolvePage(mockPages, "/users/extra", null, false)

        expect(result).toBeNull()
    })

    it("returns null for tabs page with invalid tab", () => {
        const result = resolvePage(
            mockPages,
            "/profile/123/invalid",
            null,
            false,
        )

        expect(result).toBeNull()
    })

    it("chooses most specific page when multiple matches", () => {
        const pagesWithOverlap: HeaderPage[] = [
            {
                type: "default",
                path: "/profile",
                title: "profile",
            },
            {
                type: "tabs",
                path: "/profile/{userId}",
                firstBreadcrumb: "users",
                breadcrumbParam: "userId",
                showBreadcrumbIcon: true,
                tabs: [{ label: "profile", path: "" }],
            },
        ]

        const result = resolvePage(
            pagesWithOverlap,
            "/profile/123",
            null,
            false,
        )

        expect(result?.page.type).toBe("tabs")
    })

    it("filters tabs based on user permissions", () => {
        const pagesWithRestrictions: HeaderPage[] = [
            {
                type: "tabs",
                path: "/profile/{userId}",
                firstBreadcrumb: "users",
                breadcrumbParam: "userId",
                showBreadcrumbIcon: true,
                tabs: [
                    { label: "profile", path: "" },
                    {
                        label: "settings",
                        path: "/settings",
                        requiresUserAdminOrOwner: true,
                    },
                ],
            },
        ]

        const result = resolvePage(
            pagesWithRestrictions,
            "/profile/123/settings",
            "456",
            false,
        )

        expect(result).toBeNull()
    })

    it("allows restricted tab for admin user", () => {
        const pagesWithRestrictions: HeaderPage[] = [
            {
                type: "tabs",
                path: "/profile/{userId}",
                firstBreadcrumb: "users",
                breadcrumbParam: "userId",
                showBreadcrumbIcon: true,
                tabs: [
                    { label: "profile", path: "" },
                    {
                        label: "settings",
                        path: "/settings",
                        requiresUserAdminOrOwner: true,
                    },
                ],
            },
        ]

        const result = resolvePage(
            pagesWithRestrictions,
            "/profile/123/settings",
            "456",
            true,
        )

        expect(result).not.toBeNull()
    })

    it("handles complex parameter values in matchTemplate", () => {
        const result = matchTemplate(
            "/profile/{userId}",
            "/profile/user-123-abc_DEF",
        )

        expect(result?.params.userId).toBe("user-123-abc_DEF")
    })

    it("handles numeric parameter values", () => {
        const result = matchTemplate("/profile/{id}", "/profile/12345")

        expect(result?.params.id).toBe("12345")
    })

    it("handles UUID parameter values", () => {
        const uuid = "550e8400-e29b-41d4-a716-446655440000"
        const result = matchTemplate("/profile/{id}", `/profile/${uuid}`)

        expect(result?.params.id).toBe(uuid)
    })

    it("fillPath handles empty params object", () => {
        const result = fillPath("/users", {})

        expect(result).toBe("/users")
    })

    it("fillPath handles extra params not in template", () => {
        const result = fillPath("/users/{id}", { id: "123", extra: "value" })

        expect(result).toBe("/users/123")
    })

    it("parentPath handles root path", () => {
        const result = parentPath("/")

        expect(result).toBe("/")
    })

    it("joinPaths handles multiple slashes", () => {
        const result = joinPaths("/users/123//", "//settings")

        // joinPaths doesn't normalize multiple slashes, just concatenates
        expect(result).toBe("/users/123///settings")
    })

    it("normalizePathname handles multiple query parameters", () => {
        const result = normalizePathname("/users?page=1&limit=10&search=john")

        expect(result).toBe("/users")
    })

    it("normalizePathname preserves path after locale removal", () => {
        const result = normalizePathname("/en/users/123/profile")

        expect(result).toBe("/users/123/profile")
    })

    it("resolvePage handles case-sensitive paths", () => {
        const pages: HeaderPage[] = [
            {
                type: "default",
                path: "/Users",
                title: "users",
            },
        ]

        const result = resolvePage(pages, "/users", null, false)

        expect(result).toBeNull()
    })

    it("resolvePage prefers exact match over partial match", () => {
        const pages: HeaderPage[] = [
            {
                type: "default",
                path: "/users",
                title: "users",
            },
            {
                type: "default",
                path: "/users/active",
                title: "users",
            },
        ]

        const result = resolvePage(pages, "/users/active", null, false)

        expect(result?.page.path).toBe("/users/active")
    })

    it("getVisibleTabs with multiple restricted tabs", () => {
        const page: HeaderTabsPage = {
            type: "tabs",
            path: "/profile/{userId}",
            firstBreadcrumb: "users",
            breadcrumbParam: "userId",
            showBreadcrumbIcon: true,
            tabs: [
                { label: "profile", path: "" },
                {
                    label: "settings",
                    path: "/settings",
                    requiresUserAdminOrOwner: true,
                },
                {
                    label: "cvs",
                    path: "/cvs",
                    requiresUserAdminOrOwner: true,
                },
            ],
        }

        const result = getVisibleTabs(
            page,
            { params: { userId: "123" }, remainder: "" },
            "456",
            false,
        )

        expect(result).toHaveLength(1)
        expect(result[0].label).toBe("profile")
    })

    it("matchTemplate handles cyrillic characters in URL", () => {
        const result = matchTemplate(
            "/profile/{name}",
            "/profile/%D0%98%D0%B2%D0%B0%D0%BD",
        )

        expect(result?.params.name).toBe("Иван")
    })

    it("normalizePathname handles trailing slash", () => {
        const result = normalizePathname("/users/")

        expect(result).toBe("/users")
    })

    it("resolvePage with overlapping dynamic segments", () => {
        const pages: HeaderPage[] = [
            {
                type: "tabs",
                path: "/profile/{userId}",
                firstBreadcrumb: "users",
                breadcrumbParam: "userId",
                showBreadcrumbIcon: true,
                tabs: [{ label: "profile", path: "" }],
            },
            {
                type: "tabs",
                path: "/profile/{userId}/cv/{cvId}",
                firstBreadcrumb: "cvs",
                breadcrumbParam: "cvId",
                showBreadcrumbIcon: false,
                tabs: [{ label: "cvDetails", path: "" }],
            },
        ]

        const result = resolvePage(
            pages,
            "/profile/user-123/cv/cv-456",
            null,
            false,
        )

        expect(result?.page.path).toBe("/profile/{userId}/cv/{cvId}")
    })
})
