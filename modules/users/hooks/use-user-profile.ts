import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"
import { sendProfileVerificationAction } from "@/modules/auth/api/verification"

import type { UpdateProfileInput } from "../api/update-profile"
import { updateProfile } from "../api/update-profile"
import { updateUserProfile } from "../api/update-user-profile"
import { uploadProfileAvatar } from "../api/upload-profile-avatar"

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

const MAX_AVATAR_SIZE = 0.5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/gif"])

function readFileAsBase64(file: File, errorMessage: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            if (typeof reader.result !== "string") {
                reject(new Error(errorMessage))
                return
            }

            const separator = reader.result.indexOf(",")
            if (separator < 0) {
                reject(new Error(errorMessage))
                return
            }

            resolve(reader.result.slice(separator + 1))
        }
        reader.onerror = () => {
            reject(reader.error ?? new Error(errorMessage))
        }
        reader.readAsDataURL(file)
    })
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
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [avatarError, setAvatarError] = useState<string | null>(null)

    useEffect(
        () => () => {
            if (avatarPreview) {
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
        isAssignmentChanged ||
        avatarFile !== null

    const isValid =
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        Boolean(departmentId && positionId)

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0]
        if (!file) return

        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            setAvatarFile(null)
            setAvatarPreview(null)
            setAvatarError(errors("unsupportedFileType"))
            event.currentTarget.value = ""
            return
        }

        if (file.size > MAX_AVATAR_SIZE) {
            setAvatarFile(null)
            setAvatarPreview(null)
            setAvatarError(errors("fileTooLarge"))
            event.currentTarget.value = ""
            return
        }

        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
        setAvatarError(null)
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

            if (avatarFile) {
                const base64 = await readFileAsBase64(
                    avatarFile,
                    messages("avatarUploadFailed"),
                )
                const result = await uploadProfileAvatar({
                    userId: String(user.id),
                    base64,
                    size: avatarFile.size,
                    type: avatarFile.type,
                })
                if (!result.success) {
                    notifications.error(
                        result.error || messages("avatarUploadFailed"),
                    )
                    return
                }
            }

            notifications.success("update")
            setAvatarFile(null)
            setAvatarPreview(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to save profile changes:", error)
            notifications.error(messages("updateFailed"))
        } finally {
            setIsSubmitting(false)
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
        avatarPreview,
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
    }
}
