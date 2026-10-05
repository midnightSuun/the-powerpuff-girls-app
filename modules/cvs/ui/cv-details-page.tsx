import {
    type CvDetailsTab,
    CvsDetailsPageView,
} from "@/modules/cvs/ui/cvs-details-page-view"
import { Skills } from "@/modules/skills/ui/skills"

import { getCvDetailsData } from "../hooks/use-cv-details-data"

export async function CvDetailsPage({
    id,
    activeTab,
}: {
    id: string
    activeTab: CvDetailsTab
}) {
    const { cv, session, canManage, availableProjects, handleUpdate } =
        await getCvDetailsData(id)

    const skillsContent = (
        <Skills
            userSkills={{ cvId: id, skills: cv.skills ?? [] }}
            role={session?.role}
            compact
            canManageSkills={canManage}
        />
    )

    return (
        <CvsDetailsPageView
            cv={cv}
            activeTab={activeTab}
            onUpdate={handleUpdate}
            skillsContent={skillsContent}
            availableProjects={availableProjects}
            canManageProjects={canManage}
        />
    )
}
