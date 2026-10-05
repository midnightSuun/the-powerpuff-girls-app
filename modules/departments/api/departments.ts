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

export async function getAdminDepartments() {
    const gql = await getGql()
    const data = await gql.request(GetDepartmentsDocument, {
        params: { limit: 100 },
    })

    return (data.departments?.items ?? []).map((dept) => ({
        id: dept.id,
        name: dept.name,
    }))
}

export async function createAdminDepartment(department: CreateDepartmentInput) {
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
