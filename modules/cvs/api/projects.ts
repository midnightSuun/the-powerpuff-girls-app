"use server"

import { getGql } from "@/gql"
import {
    AddCvProjectDocument,
    AddCvProjectInput,
    CreateProjectDocument,
    CreateProjectInput,
    DeleteProjectDocument,
    DeleteProjectInput,
    GetProjectsDocument,
    RemoveCvProjectDocument,
    RemoveCvProjectInput,
    UpdateCvProjectDocument,
    UpdateCvProjectInput,
    UpdateProjectDocument,
    UpdateProjectInput,
} from "@/gql/generated/graphql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

async function requireAdmin() {
    const session = await getCurrentSession()

    if (session?.role !== "Admin") {
        throw new Error("Forbidden")
    }
}

export async function getAvailableProjects() {
    const gql = await getGql()
    const data = await gql.request(GetProjectsDocument)

    return data.projects.items
}

export async function createProject(project: CreateProjectInput) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(CreateProjectDocument, { project })

    return data.createProject
}

export async function updateProject(project: UpdateProjectInput) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(UpdateProjectDocument, { project })

    return data.updateProject
}

export async function deleteProject(project: DeleteProjectInput) {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(DeleteProjectDocument, { project })

    return data.deleteProject
}

export async function addCvProject(project: AddCvProjectInput) {
    const gql = await getGql()
    const data = await gql.request(AddCvProjectDocument, { project })

    return data.addCvProject
}

export async function updateCvProject(project: UpdateCvProjectInput) {
    const gql = await getGql()
    const data = await gql.request(UpdateCvProjectDocument, { project })

    return data.updateCvProject
}

export async function removeCvProject(project: RemoveCvProjectInput) {
    const gql = await getGql()
    const data = await gql.request(RemoveCvProjectDocument, { project })

    return data.removeCvProject
}
