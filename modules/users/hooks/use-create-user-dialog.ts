"use client"

import { useTranslations } from "next-intl"
import { type SubmitEvent, useEffect, useRef, useState } from "react"

import type { UserRole } from "@/gql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"

import { createUser } from "../api/create-user"
import { getProfileOptions } from "../api/get-profile-options"

type SelectOption = {
    id: string
    name: string
}

type FormState = {
    email: string
    password: string
    firstName: string
    lastName: string
    departmentId: string
    positionId: string
    role: UserRole
}

const emptyForm: FormState = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    departmentId: "",
    positionId: "",
    role: "Employee",
}

export const useCreateUserDialog = () => {
    const tDialog = useTranslations("Users.dialog")
    const tMessages = useTranslations("Users.messages")
    const notifications = useActionNotifications()
    const router = useRouter()
    const isCreatingRef = useRef(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [departments, setDepartments] = useState<SelectOption[]>([])
    const [positions, setPositions] = useState<SelectOption[]>([])

    const roleOptions: SelectOption[] = [
        { id: "Employee", name: tDialog("employee") },
        { id: "Admin", name: tDialog("admin") },
    ]

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) setForm(emptyForm)
    }

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
                setDepartments(data.departments)
                setPositions(data.positions)
            } catch (error) {
                console.error("Failed to load create user options:", error)
            }
        }

        void loadOptions()

        return () => {
            isCancelled = true
        }
    }, [isOpen])

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isCreatingRef.current) return

        isCreatingRef.current = true
        setIsSubmitting(true)

        try {
            const result = await createUser(form)

            if (!result.success) {
                notifications.error(result.error || tMessages("createFailed"))
                return
            }

            notifications.success("created")
            setForm(emptyForm)
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Failed to create user:", error)
            notifications.error(tMessages("createFailed"))
        } finally {
            isCreatingRef.current = false
            setIsSubmitting(false)
        }
    }

    return {
        isOpen,
        isSubmitting,
        form,
        departments,
        positions,
        roleOptions,
        handleOpenChange,
        handleChange,
        handleSubmit,
    }
}
