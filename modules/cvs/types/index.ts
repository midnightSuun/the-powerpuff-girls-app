import { Mastery, Proficiency } from "@/gql"

export interface CvItem {
    id: string
    created_at?: string
    name: string
    education: string
    description: string
    user?: {
        id?: string
        email: string
        role?: string
    } | null
    projects?: Array<{ id: string; name: string } | null> | null
    skills?: Array<{
        name: string
        mastery: Mastery
        categoryId?: string | null
    }> | null
    languages?: Array<{ name: string; proficiency: Proficiency }> | null
}

export type CvDetailsItem = Omit<CvItem, "projects"> & {
    projects?: CvProjectItem[] | null
}

export interface CvProjectItem {
    id: string
    project: {
        id: string
    }
    name: string
    internal_name: string
    description: string
    domain: string
    start_date: string
    end_date: string | null
    environment: string[]
    roles: string[]
    responsibilities: string[]
}

export interface ProjectOption {
    id: string
    name: string
    internal_name: string
    domain: string
    description: string
    environment: string[]
}

export interface UpdateCvDto {
    name: string
    education: string
    description: string
}
