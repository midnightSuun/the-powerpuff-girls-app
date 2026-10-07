"use client"

import { useTranslations } from "next-intl"
import { type SubmitEvent, useEffect, useRef, useState } from "react"

import type { GetUsersQuery, UserRole } from "@/gql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"

import { getProfileOptions } from "../api/get-profile-options"
import { updateUser } from "../api/update-user"

export type EditableUser = GetUsersQuery["users"]["items"][number]

type SelectOption = {
    id: string
    name: string
}

type FormState = {
    firstName: string
    lastName: string
    departmentId: string
    positionId: string
    role: UserRole
}

const formFromUser = (user: EditableUser): FormState => ({
    firstName: user.profile.first_name ?? "",
    lastName: user.profile.last_name ?? "",
    departmentId: user.department?.id ?? "",
    positionId: user.position?.id ?? "",
    role: user.role,
})

const withCurrentOption = (
    options: SelectOption[],
    current: SelectOption | null,
) => {
    if (!current || options.some((option) => option.id === current.id)) {
        return options
    }

    return [current, ...options]
}

export const useUpdateUserDialog = (user: EditableUser, isOpen: boolean) => {
    const tDialog = useTranslations("Users.dialog")
    const tMessages = useTranslations("Users.messages")
    const notifications = useActionNotifications()
    const router = useRouter()
    const isUpdatingRef = useRef(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState<FormState>(() => formFromUser(user))
    const [departments, setDepartments] = useState<SelectOption[]>(() =>
        user.department ? [user.department] : [],
    )
    const [positions, setPositions] = useState<SelectOption[]>(() =>
        user.position ? [user.position] : [],
    )

    const roleOptions: SelectOption[] = [
        { id: "Employee", name: tDialog("employee") },
        { id: "Admin", name: tDialog("admin") },
    ]

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((current) => ({
            ...current,
            [field]: field === "role" ? (value as UserRole) : value,
        }))
    }

    useEffect(() => {
        if (!isOpen) return

        let isCancelled = false

        const loadOptions = async () => {
            try {
                const data = await getProfileOptions()
                if (isCancelled) return
                setDepartments(
                    withCurrentOption(data.departments, user.department),
                )
                setPositions(withCurrentOption(data.positions, user.position))
            } catch (error) {
                console.error("Failed to load update user options:", error)
            }
        }

        void loadOptions()

        return () => {
            isCancelled = true
        }
    }, [isOpen, user])

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isUpdatingRef.current) return

        isUpdatingRef.current = true
        setIsSubmitting(true)

        try {
            const result = await updateUser({
                userId: user.id,
                ...form,
            })

            if (!result.success) {
                notifications.error(result.error || tMessages("updateFailed"))
                return false
            }

            notifications.success("updated")
            router.refresh()
            return true
        } catch (error) {
            console.error("Failed to update user:", error)
            notifications.error(tMessages("updateFailed"))
            return false
        } finally {
            isUpdatingRef.current = false
            setIsSubmitting(false)
        }
    }

    return {
        isSubmitting,
        form,
        departments,
        positions,
        roleOptions,
        handleChange,
        handleSubmit,
    }
}
