import { notFound } from "next/navigation"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getCvById } from "@/modules/cvs/api/get-cv"
import { getAvailableProjects } from "@/modules/cvs/api/projects"
import { updateCvAction } from "@/modules/cvs/api/update-cv"

export async function getCvDetailsData(id: string) {
    const result = await getCvById(id)

    if (result.error || !result.data) {
        notFound()
    }

    const cv = {
        ...result.data,
        education: result.data.education ?? "",
    }

    const session = await getCurrentSession()
    const canManage = session?.role === "Employee" || session?.role === "Admin"

    const availableProjects = canManage ? await getAvailableProjects() : []

    const handleUpdate = async (data: {
        name: string
        education: string
        description: string
    }) => {
        "use server"

        const response = await updateCvAction({
            cvId: id,
            name: data.name,
            education: data.education,
            description: data.description,
        })

        if (response.error) {
            throw new Error(response.error)
        }
    }

    return {
        cv,
        session,
        canManage,
        availableProjects,
        handleUpdate,
    }
}
