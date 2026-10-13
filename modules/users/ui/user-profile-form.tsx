"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { GetProfileOptionsQuery, GetUserQuery, UserRole } from "@/gql"

import { getUserDisplayName } from "../get-user-display-name"
import { useUserProfile } from "../hooks/use-user-profile"
import { withCurrentOption } from "../select-option"
import { UserAvatar } from "./user-avatar"
import { UserProfileSelect, UserProfileTextField } from "./user-profile-field"

interface UserProfileFormProps {
    user: GetUserQuery["user"]
    currentUserId: string | number
    currentUserRole?: UserRole | string | null
    departments: GetProfileOptionsQuery["departments"]["items"]
    positions: GetProfileOptionsQuery["positions"]["items"]
}

export function UserProfileForm({
    user,
    currentUserId,
    currentUserRole,
    departments,
    positions,
}: UserProfileFormProps) {
    const t = useTranslations("User")
    const locale = useLocale()
    const [isHovered, setIsHovered] = useState(false)

    const departmentOptions = withCurrentOption(departments, user.department)
    const positionOptions = withCurrentOption(positions, user.position)

    const {
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
        avatarPreview,
        hasSubmitted,
        isSubmitting,
        isVerifyingEmail,
        avatarError,
        isChanged,
        isValid,
        handleUpdate,
        handleAvatarChange,
        handleRemoveAvatar,
        handleVerifyEmail,
    } = useUserProfile(user, currentUserId, currentUserRole)

    const parseCreatedAt = (rawDate: unknown) => {
        if (!rawDate) return null

        if (typeof rawDate === "string" && /^\d+$/.test(rawDate)) {
            const num = Number(rawDate)
            return new Date(rawDate.length === 10 ? num * 1000 : num)
        }

        const date = new Date(rawDate as string | number)
        return Number.isNaN(date.getTime()) ? null : date
    }

    const createdAtDate = parseCreatedAt(user.created_at)
    const formattedCreatedAt = createdAtDate
        ? new Intl.DateTimeFormat(locale, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
          }).format(createdAtDate)
        : user.created_at

    const currentAvatarSrc =
        avatarPreview !== null
            ? (avatarPreview ?? user.profile?.avatar ?? null)
            : null

    return (
        <form
            onSubmit={handleUpdate}
            className="w-full max-w-5xl mx-auto space-y-8 px-4 sm:px-8 py-6"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                    <div className="relative inline-block">
                        <div
                            className="relative w-28 h-28 text-3xl shrink-0 shadow-sm rounded-full overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <UserAvatar
                                src={currentAvatarSrc}
                                firstName={firstName}
                                lastName={lastName}
                                email={user.email}
                                fallbackClassName="bg-[#c63031] text-white"
                                avatarClassName="size-full"
                            />
                        </div>

                        {canEdit && currentAvatarSrc && isHovered && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                aria-label="Remove avatar"
                                className="absolute -top-1 -right-1 size-7 rounded-full bg-button-primary-default text-white flex items-center justify-center text-xs shadow-md hover:bg-[#b02a2b] transition-transform hover:scale-105 z-30"
                                onMouseEnter={() => setIsHovered(true)}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {canEdit && (
                        <label className="cursor-pointer inline-flex flex-col items-start text-left">
                            <span className="text-sm font-medium text-foreground hover:underline flex items-center gap-2">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                                {t("uploadAvatar")}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1">
                                png, jpg or gif no more than 5MB
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    )}
                </div>
                {avatarError && (
                    <span className="text-xs text-red-500">{avatarError}</span>
                )}

                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {getUserDisplayName(firstName, lastName, user.email)}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {t("memberSince", {
                            date: formattedCreatedAt,
                        })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <UserProfileTextField
                    id="profile-first-name"
                    label={t("firstName")}
                    value={firstName}
                    disabled={!canEdit}
                    error={
                        hasSubmitted && !firstName.trim()
                            ? t("errors.firstNameRequired")
                            : undefined
                    }
                    onChange={setFirstName}
                />
                <UserProfileTextField
                    id="profile-last-name"
                    label={t("lastName")}
                    value={lastName}
                    disabled={!canEdit}
                    error={
                        hasSubmitted && !lastName.trim()
                            ? t("errors.lastNameRequired")
                            : undefined
                    }
                    onChange={setLastName}
                />
                <UserProfileSelect
                    label={t("department")}
                    placeholder={t("selectDepartment")}
                    value={departmentId}
                    options={departmentOptions}
                    disabled={!canEdit}
                    error={
                        hasSubmitted && !departmentId
                            ? t("errors.departmentRequired")
                            : undefined
                    }
                    onChange={setDepartmentId}
                />
                <UserProfileSelect
                    label={t("position")}
                    placeholder={t("selectPosition")}
                    value={positionId}
                    options={positionOptions}
                    disabled={!canEdit}
                    error={
                        hasSubmitted && !positionId
                            ? t("errors.positionRequired")
                            : undefined
                    }
                    onChange={setPositionId}
                />
            </div>

            {canEdit && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-border">
                    {canVerifyEmail && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleVerifyEmail}
                            disabled={isVerifyingEmail}
                            className="h-9 w-full px-4 py-0 text-[10px] font-normal sm:w-30"
                        >
                            {isVerifyingEmail
                                ? t("sendingVerification")
                                : t("verifyEmail")}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={(!isChanged && isValid) || isSubmitting}
                        className="h-9 w-full px-4 py-0 text-[10px] font-normal sm:w-30"
                    >
                        {isSubmitting ? t("updating") : t("update")}
                    </Button>
                </div>
            )}
        </form>
    )
}
