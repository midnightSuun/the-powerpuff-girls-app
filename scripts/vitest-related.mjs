import { spawnSync } from "node:child_process"

spawnSync("npx", ["vitest", "related", "--run", ...process.argv.slice(2)], {
    stdio: "inherit",
    shell: true,
})

process.exit(0)
