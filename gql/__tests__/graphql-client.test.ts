import { beforeEach, describe, expect, it, vi } from "vitest"

import { getGraphQlClient, getGql, getRequestOrigin } from "../graphql-client"

vi.mock("next/headers", () => ({
    headers: vi.fn(),
    cookies: vi.fn(),
}));

vi.mock("graphql-request", () => {
    return {
        GraphQLClient: class MockGraphQLClient {
            endpoint: string
            options: { headers?: Record<string, string> }

            constructor(endpoint: string, options: { headers?: Record<string, string> }) {
                this.endpoint = endpoint
                this.options = options
            }
        },
    }
})

describe("GraphQL Client Utilities", () => {
    const originalEnv = process.env.GRAPHQL_URL

    beforeEach(() => {
        vi.clearAllMocks()
        process.env.GRAPHQL_URL = "http://localhost:4000/graphql"
    })

    afterEach(() => {
        process.env.GRAPHQL_URL = originalEnv
    })

    describe("getRequestOrigin", () => {
        it("returns protocol and x-forwarded-host when present", async () => {
            const { headers } = await import("next/headers")
            vi.mocked(headers).mockResolvedValueOnce({
                get: (key: string) => {
                    if (key === "x-forwarded-host") return "example.com"
                    if (key === "x-forwarded-proto") return "https"
                    return null
                },
            } as unknown as ReturnType<typeof headers> extends Promise<infer T> ? T : never)

            const origin = await getRequestOrigin()
            expect(origin).toBe("https://example.com")
        })

        it("falls back to host and http when x-forwarded headers are missing", async () => {
            const { headers } = await import("next/headers")
            vi.mocked(headers).mockResolvedValueOnce({
                get: (key: string) => {
                    if (key === "host") return "my-local-host:3000"
                    return null
                },
            } as unknown as ReturnType<typeof headers> extends Promise<infer T> ? T : never)

            const origin = await getRequestOrigin()
            expect(origin).toBe("http://my-local-host:3000")
        })

        it("falls back to localhost:3000 when no headers are available", async () => {
            const { headers } = await import("next/headers")
            vi.mocked(headers).mockResolvedValueOnce({
                get: () => null,
            } as unknown as ReturnType<typeof headers> extends Promise<infer T> ? T : never)

            const origin = await getRequestOrigin()
            expect(origin).toBe("http://localhost:3000")
        })
    })

    describe("getGraphQlClient", () => {
        it("creates client with Authorization header when token is provided", () => {
            const client = getGraphQlClient("my-test-token", { "x-custom": "value" }) as unknown as {
                endpoint: string
                options: { headers: Record<string, string> }
            }

            expect(client.endpoint).toBe("http://localhost:4000/graphql")
            expect(client.options.headers).toEqual({
                Authorization: "Bearer my-test-token",
                "x-custom": "value",
            })
        })

        it("creates client without Authorization header when token is omitted", () => {
            const client = getGraphQlClient(undefined, { "x-custom": "value" }) as unknown as {
                endpoint: string
                options: { headers: Record<string, string> }
            }

            expect(client.options.headers).toEqual({
                "x-custom": "value",
            })
        })
    })

    describe("getGql", () => {
        it("uses explicit token and request origin correctly", async () => {
            const { cookies, headers } = await import("next/headers")
            
            vi.mocked(headers).mockResolvedValueOnce({
                get: (key: string) => (key === "host" ? "app.test" : null),
            } as unknown as ReturnType<typeof headers> extends Promise<infer T> ? T : never)

            vi.mocked(cookies).mockResolvedValueOnce({
                get: () => undefined,
            } as unknown as ReturnType<typeof cookies> extends Promise<infer T> ? T : never)

            const client = (await getGql("explicit-token")) as unknown as {
                options: { headers: Record<string, string> }
            }

            expect(client.options.headers).toEqual({
                Authorization: "Bearer explicit-token",
                origin: "http://app.test",
            })
        })

        it("falls back to cookie token when explicit token is not provided", async () => {
            const { cookies, headers } = await import("next/headers")

            vi.mocked(headers).mockResolvedValueOnce({
                get: (key: string) => (key === "host" ? "app.test" : null),
            } as unknown as ReturnType<typeof headers> extends Promise<infer T> ? T : never)

            vi.mocked(cookies).mockResolvedValueOnce({
                get: (key: string) => (key === "access_token" ? { value: "cookie-token" } : undefined),
            } as unknown as ReturnType<typeof cookies> extends Promise<infer T> ? T : never)

            const client = (await getGql()) as unknown as {
                options: { headers: Record<string, string> }
            }

            expect(client.options.headers).toEqual({
                Authorization: "Bearer cookie-token",
                origin: "http://app.test",
            })
        })
    })
})