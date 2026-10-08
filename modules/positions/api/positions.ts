"use server"

import { revalidatePath } from "next/cache"

import { getGql } from "@/gql"
import {
    CreatePositionDocument,
    CreatePositionInput,
    DeletePositionDocument,
    DeletePositionInput,
    GetPositionsDocument,
    UpdatePositionDocument,
    UpdatePositionInput,
} from "@/gql/generated/graphql"
import { requireAdmin } from "@/modules/auth/helpers/require-admin"

export async function getAdminPositions() {
    await requireAdmin()
    const gql = await getGql()
    const data = await gql.request(GetPositionsDocument, {
        params: { limit: 100 },
    })

    return (data.positions?.items ?? []).map((pos) => ({
        id: pos.id,
        name: pos.name,
    }))
}

export async function createAdminPosition(position: CreatePositionInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(CreatePositionDocument, { position })

        revalidatePath("/positions")
        return data.createPosition
    } catch (err: unknown) {
        console.error("Failed to create position:", err)
        throw new Error("Failed to create position")
    }
}

export async function updateAdminPosition(position: UpdatePositionInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(UpdatePositionDocument, { position })

        revalidatePath("/positions")
        return data.updatePosition
    } catch (err: unknown) {
        console.error("Failed to update position:", err)
        throw new Error("Failed to update position")
    }
}

export async function deleteAdminPosition(position: DeletePositionInput) {
    await requireAdmin()
    try {
        const gql = await getGql()
        const data = await gql.request(DeletePositionDocument, { position })

        revalidatePath("/positions")
        return data.deletePosition
    } catch (err: unknown) {
        console.error("Failed to delete position:", err)
        throw new Error(
            "Position cannot be deleted because it is currently in use",
        )
    }
}
