"use client"

import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GetProfileOptionsQuery, GetUserQuery, UserRole } from "@/gql"

import { useUserProfile } from "../hooks/use-user-profile"
import { UserAvatar } from "./user-avatar"

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

    const departmentOptions =
        user.department &&
        !departments.some(({ id }) => id === user.department?.id)
            ? [user.department, ...departments]
            : departments
    const positionOptions =
        user.position && !positions.some(({ id }) => id === user.position?.id)
            ? [user.position, ...positions]
            : positions

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

    return (
        <form
            onSubmit={handleUpdate}
            className="w-full max-w-5xl mx-auto space-y-8 px-4 sm:px-8 py-6"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                    <div className="w-28 h-28 text-3xl shrink-0 shadow-sm rounded-full overflow-hidden">
                        <UserAvatar
                            src={avatarPreview ?? user.profile?.avatar ?? null}
                            firstName={firstName}
                            lastName={lastName}
                            email={user.email}
                            fallbackClassName="bg-[#c63031] text-white"
                            avatarClassName="size-full"
                        />
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
                                {t("avatarRequirements")}
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
                        {[firstName, lastName].filter(Boolean).join(" ") ||
                            user.email}
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
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="profile-first-name"
                        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                        {t("firstName")}
                    </label>
                    <Input
                        id="profile-first-name"
                        type="text"
                        maxLength={100}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!canEdit}
                        aria-invalid={hasSubmitted && !firstName.trim()}
                        className="h-12 bg-background border-input text-foreground rounded-md shadow-xs disabled:cursor-not-allowed"
                    />
                    {hasSubmitted && !firstName.trim() && (
                        <span className="text-xs text-red-500">
                            {t("errors.firstNameRequired")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="profile-last-name"
                        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                        {t("lastName")}
                    </label>
                    <Input
                        id="profile-last-name"
                        type="text"
                        maxLength={100}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!canEdit}
                        aria-invalid={hasSubmitted && !lastName.trim()}
                        className="h-12 bg-background border-input text-foreground rounded-md shadow-xs disabled:cursor-not-allowed"
                    />
                    {hasSubmitted && !lastName.trim() && (
                        <span className="text-xs text-red-500">
                            {t("errors.lastNameRequired")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("department")}
                    </label>
                    <div className="relative">
                        <select
                            value={departmentId}
                            onChange={(event) =>
                                setDepartmentId(event.target.value)
                            }
                            disabled={!canEdit}
                            aria-invalid={hasSubmitted && !departmentId}
                            className="w-full h-12 px-4 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:opacity-100 disabled:cursor-not-allowed enabled:cursor-pointer appearance-none shadow-xs"
                        >
                            <option value="">{t("selectDepartment")}</option>
                            {departmentOptions.map((department) => (
                                <option
                                    key={department.id}
                                    value={department.id}
                                >
                                    {department.name}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-4 pointer-events-none text-xs text-muted-foreground">
                            ▼
                        </span>
                    </div>
                    {hasSubmitted && !departmentId && (
                        <span className="text-xs text-red-500">
                            {t("errors.departmentRequired")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t("position")}
                    </label>
                    <div className="relative">
                        <select
                            value={positionId}
                            onChange={(event) =>
                                setPositionId(event.target.value)
                            }
                            disabled={!canEdit}
                            aria-invalid={hasSubmitted && !positionId}
                            className="w-full h-12 px-4 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:opacity-100 disabled:cursor-not-allowed enabled:cursor-pointer appearance-none shadow-xs"
                        >
                            <option value="">{t("selectPosition")}</option>
                            {positionOptions.map((position) => (
                                <option key={position.id} value={position.id}>
                                    {position.name}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-4 pointer-events-none text-xs text-muted-foreground">
                            ▼
                        </span>
                    </div>
                    {hasSubmitted && !positionId && (
                        <span className="text-xs text-red-500">
                            {t("errors.positionRequired")}
                        </span>
                    )}
                </div>
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
