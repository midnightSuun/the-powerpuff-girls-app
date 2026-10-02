import { notFound } from "next/navigation"

import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { getCvById } from "@/modules/cvs/api/get-cv"
import { getAvailableProjects } from "@/modules/cvs/api/projects"
import { updateCvAction } from "@/modules/cvs/api/update-cv"
import { CvsDetailsPageView } from "@/modules/cvs/ui/cvs-details-page-view"
import { Skills } from "@/modules/skills/ui/skills"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CvDetailsPage({ params }: PageProps) {
    const { id } = await params

    const result = await getCvById(id)

    if (result.error || !result.data) {
        notFound()
    }

    const cv = {
        ...result.data,
        education: result.data.education ?? "",
    }
    const session = await getCurrentSession()
    const canManageProjects = session?.role === "Employee"
    const availableProjects = canManageProjects
        ? await getAvailableProjects()
        : []
    const skillsContent = (
        <Skills
            userSkills={{ cvId: id, skills: cv.skills ?? [] }}
            role={session?.role}
            compact
        />
    )

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

    return (
        <CvsDetailsPageView
            cv={cv}
            onUpdate={handleUpdate}
            skillsContent={skillsContent}
            availableProjects={availableProjects}
            canManageProjects={canManageProjects}
        />
    )
}
