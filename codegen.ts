import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
    schema: "http://127.0.0.1:3001/api/graphql",
    documents: "modules/**/*.graphql",
    generates: {
        "./gql/generated/": {
            preset: "client",
        },
    },
}

export default config
