import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
    schema: "http://localhost:3001/api/graphql",
    documents: "modules/**/*.graphql",
    generates: {
        "./gql/generated/": {
            preset: "client",
        },
    },
}

export default config
