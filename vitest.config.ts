import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"
process.env.NODE_COMPILE_CACHE ??= "node_modules/.cache/v8-compile-cache"

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: "happy-dom",
        globals: true,
        isolate: false,
        setupFiles: "./vitest.setup.ts",
        pool: "threads",
        server: {
            deps: {
                inline: [/@swc\/helpers/, "next-intl"],
            },
        },
    },
})
