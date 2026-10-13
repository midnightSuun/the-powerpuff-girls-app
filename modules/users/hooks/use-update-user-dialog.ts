"use client"

import { useTranslations } from "next-intl"
import { type SubmitEvent, useRef, useState } from "react"

import type { GetUsersQuery, UserRole } from "@/gql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"

import { updateUser } from "../api/update-user"
import { getUserRoleOptions } from "../user-role-options"
import { useProfileOptions } from "./use-profile-options"

export type EditableUser = GetUsersQuery["users"]["items"][number]

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

export const useUpdateUserDialog = (user: EditableUser, isOpen: boolean) => {
    const tDialog = useTranslations("Users.dialog")
    const tMessages = useTranslations("Users.messages")
    const notifications = useActionNotifications()
    const router = useRouter()
    const isUpdatingRef = useRef(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState<FormState>(() => formFromUser(user))
    const userKey = [
        user.id,
        user.profile.first_name ?? "",
        user.profile.last_name ?? "",
        user.department?.id ?? "",
        user.position?.id ?? "",
        user.role,
    ].join("\0")
    const [syncedUserKey, setSyncedUserKey] = useState(userKey)

    if (userKey !== syncedUserKey) {
        setSyncedUserKey(userKey)
        setForm(formFromUser(user))
    }

    const { departments, positions } = useProfileOptions(
        isOpen,
        user.department,
        user.position,
    )

    const roleOptions = getUserRoleOptions(tDialog)

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((current) => ({
            ...current,
            [field]: field === "role" ? (value as UserRole) : value,
        }))
    }

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
