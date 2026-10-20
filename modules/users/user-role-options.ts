import type { UserRole } from "@/gql"

type RoleLabelKey = "employee" | "admin"

const userRoles: { id: UserRole; labelKey: RoleLabelKey }[] = [
    { id: "Employee", labelKey: "employee" },
    { id: "Admin", labelKey: "admin" },
]

export const getUserRoleOptions = (t: (key: RoleLabelKey) => string) =>
    userRoles.map((role) => ({
        id: role.id,
        name: t(role.labelKey),
    }))
