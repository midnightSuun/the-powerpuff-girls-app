import type { UserRole } from "@/gql"

export function isUserRole(role: unknown): role is UserRole {
    return role === "Admin" || role === "Employee"
}
