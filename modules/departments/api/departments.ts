"use server"

import { revalidatePath } from "next/cache"

import { getGql } from "@/gql"
import {
    CreateDepartmentDocument,
    CreateDepartmentInput,
    DeleteDepartmentDocument,
    DeleteDepartmentInput,
    GetDepartmentsDocument,
    UpdateDepartmentDocument,
    UpdateDepartmentInput,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

export async function getAdminDepartments(search: string) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(GetDepartmentsDocument, {
        params: { limit: 100, search: search },
    })

    return (data.departments?.items ?? []).map((dept) => ({
        id: dept.id,
        name: dept.name,
    }))
}

export async function createAdminDepartment(department: CreateDepartmentInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(CreateDepartmentDocument, { department })

        revalidatePath("/departments")
        return data.createDepartment
    } catch (err: unknown) {
        console.error("Failed to create department:", err)
        throw new Error("Failed to create department")
    }
}

export async function updateAdminDepartment(department: UpdateDepartmentInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(UpdateDepartmentDocument, { department })

        revalidatePath("/departments")
        return data.updateDepartment
    } catch (err: unknown) {
        console.error("Failed to update department:", err)
        throw new Error("Failed to update department")
    }
}

export async function deleteAdminDepartment(department: DeleteDepartmentInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(DeleteDepartmentDocument, { department })

        revalidatePath("/departments")
        return data.deleteDepartment
    } catch (err: unknown) {
        console.error("Failed to delete department:", err)
        throw new Error(
            "Department cannot be deleted because it is currently in use",
        )
    }
}
