"use server"

import { getGql } from "@/gql"
import {
    AddCvProjectDocument,
    AddCvProjectInput,
    GetProjectsDocument,
    RemoveCvProjectDocument,
    RemoveCvProjectInput,
    UpdateCvProjectDocument,
    UpdateCvProjectInput,
} from "@/gql/generated/graphql"

export async function getAvailableProjects() {
    const gql = await getGql()
    const data = await gql.request(GetProjectsDocument)

    return data.projects.items
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
