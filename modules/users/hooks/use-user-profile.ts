import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"
import { sendProfileVerificationAction } from "@/modules/auth/api/verification"

import { deleteAvatar } from "../api/delete-profile-avatar"
import type { UpdateProfileInput } from "../api/update-profile"
import { updateProfile } from "../api/update-profile"
import { updateUserProfile } from "../api/update-user-profile"
import { uploadProfileAvatar } from "../api/upload-profile-avatar"
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from "../constants"

interface ProfileOption {
    id: string
    name: string
}

interface UserData {
    id: string | number
    email: string
    is_verified?: boolean
    isVerified?: boolean
    role?: string | null
    profile?: {
        first_name?: string | null
        firstName?: string | null
        last_name?: string | null
        lastName?: string | null
        avatar?: string | null
    }
    department?: ProfileOption | null
    position?: ProfileOption | null
}

export function useUserProfile(
    user: UserData,
    currentUserId: string | number,
    currentUserRole?: string | null,
) {
    const notifications = useActionNotifications()
    const router = useRouter()
    const errors = useTranslations("User.errors")
    const messages = useTranslations("User.messages")

    const initialFirstName =
        user.profile?.first_name ?? user.profile?.firstName ?? ""
    const initialLastName =
        user.profile?.last_name ?? user.profile?.lastName ?? ""

    const [firstName, setFirstName] = useState(initialFirstName)
    const [lastName, setLastName] = useState(initialLastName)
    const [departmentId, setDepartmentId] = useState(user.department?.id ?? "")
    const [positionId, setPositionId] = useState(user.position?.id ?? "")
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.profile?.avatar ?? null,
    )

    const [isAvatarDeleted, setIsAvatarDeleted] = useState(false)

    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [avatarError, setAvatarError] = useState<string | null>(null)

    useEffect(
        () => () => {
            if (avatarPreview && avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview)
            }
        },
        [avatarPreview],
    )

    const canEdit =
        String(currentUserId) === String(user.id) || currentUserRole === "Admin"

    const isVerified = user.is_verified ?? user.isVerified ?? false
    const canVerifyEmail =
        String(currentUserId) === String(user.id) && !isVerified

    const isAssignmentChanged =
        departmentId !== (user.department?.id ?? "") ||
        positionId !== (user.position?.id ?? "")

    const isChanged =
        firstName !== initialFirstName ||
        lastName !== initialLastName ||
        isAssignmentChanged

    const isValid =
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        Boolean(departmentId && positionId)

    const handleAvatarChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const inputElement = event.currentTarget
        const file = inputElement.files?.[0]
        if (!file) return

        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            setAvatarError(errors("unsupportedFileType"))
            notifications.error(errors("unsupportedFileType"))
            inputElement.value = ""
            return
        }

        if (file.size > MAX_AVATAR_SIZE) {
            setAvatarError(errors("fileTooLarge"))
            notifications.error(errors("fileTooLarge"))
            inputElement.value = ""
            return
        }

        setAvatarError(null)
        setAvatarFile(file)
        setIsAvatarDeleted(false)

        const tempPreview = URL.createObjectURL(file)
        setAvatarPreview(tempPreview)

        try {
            const formData = new FormData()
            formData.append("userId", String(user.id))
            formData.append("file", file)

            const result = await uploadProfileAvatar(formData)

            if (!result.success) {
                setAvatarPreview(user.profile?.avatar ?? null)
                notifications.error(
                    result.error || messages("avatarUploadFailed"),
                )
                return
            }

            notifications.success("update")
            router.refresh()
        } catch (error) {
            console.error("Failed to upload avatar:", error)
            setAvatarPreview(user.profile?.avatar ?? null)
            notifications.error(messages("avatarUploadFailed"))
        } finally {
            inputElement.value = ""
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setHasSubmitted(true)

        if (!canEdit || !isValid) return

        setIsSubmitting(true)
        try {
            const namesChanged =
                firstName !== initialFirstName || lastName !== initialLastName

            if (namesChanged) {
                const profileInput: UpdateProfileInput = {
                    userId: String(user.id),
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                }
                const result = await updateProfile(profileInput)
                if (!result.success) {
                    notifications.error(
                        result.error || messages("updateFailed"),
                    )
                    return
                }
            }

            if (isAssignmentChanged) {
                const result = await updateUserProfile({
                    userId: String(user.id),
                    departmentId,
                    positionId,
                })
                if (!result.success) {
                    notifications.error(
                        result.error || messages("updateFailed"),
                    )
                    return
                }
            }

            notifications.success("update")
            router.refresh()
        } catch (error) {
            console.error("Failed to save profile changes:", error)
            notifications.error(messages("updateFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (!canEdit) return
        try {
            setAvatarError(null)
            setAvatarFile(null)
            setAvatarPreview(null)
            setIsAvatarDeleted(true)

            const result = await deleteAvatar({ userId: String(user.id) })

            if (!result.success) {
                notifications.error(result.error || messages("updateFailed"))
                return
            }

            notifications.success("update")
            router.refresh()
        } catch (error) {
            console.error("Failed to delete avatar:", error)
            notifications.error(messages("avatarUploadFailed"))
        }
    }

    const handleVerifyEmail = async () => {
        setIsVerifyingEmail(true)
        try {
            const result = await sendProfileVerificationAction()
            if (result.error) {
                notifications.error(result.error)
                return
            }

            notifications.success("emailVerified")
            router.push(`/verify-email?email=${encodeURIComponent(user.email)}`)
        } catch (error) {
            console.error(
                "Failed to request profile email verification:",
                error,
            )
            notifications.error(messages("verificationFailed"))
        } finally {
            setIsVerifyingEmail(false)
        }
    }

    return {
        canEdit,
        canVerifyEmail,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        departmentId,
        setDepartmentId,
        positionId,
        setPositionId,
        avatarFile,
        avatarPreview: isAvatarDeleted ? null : avatarPreview,
        isAssignmentChanged,
        hasSubmitted,
        isSubmitting,
        isVerifyingEmail,
        avatarError,
        isChanged,
        isValid,
        handleUpdate,
        handleAvatarChange,
        handleVerifyEmail,
        handleRemoveAvatar,
    }
}
