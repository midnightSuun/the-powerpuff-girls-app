import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// Enable Node's V8 bytecode cache to speed up repeated runs
process.env.NODE_COMPILE_CACHE ??= "node_modules/.cache/v8-compile-cache"

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: "happy-dom",
        globals: true,
        setupFiles: "./vitest.setup.ts",
        pool: "threads",
        server: {
            deps: {
                inline: [/@swc\/helpers/, "next-intl"],
            },
        },
    },
})
