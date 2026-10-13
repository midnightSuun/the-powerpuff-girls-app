"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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

const clsx = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(" ")

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
                    <Input
                        id="profile-first-name"
                        type="text"
                        label={t("firstName")}
                        placeholder={t("firstName")}
                        maxLength={100}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!canEdit}
                        error={
                            hasSubmitted && !firstName.trim()
                                ? t("errors.firstNameRequired")
                                : undefined
                        }
                        className="h-12 bg-background border-input text-foreground rounded-md shadow-xs disabled:cursor-not-allowed"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Input
                        id="profile-last-name"
                        type="text"
                        label={t("lastName")}
                        placeholder={t("lastName")}
                        maxLength={100}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!canEdit}
                        error={
                            hasSubmitted && !lastName.trim()
                                ? t("errors.lastNameRequired")
                                : undefined
                        }
                        className="h-12 bg-background border-input text-foreground rounded-md shadow-xs disabled:cursor-not-allowed"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-muted-foreground">
                        {t("department")}
                    </label>
                    <Select
                        value={departmentId}
                        onValueChange={(val) => setDepartmentId(val ?? "")}
                        disabled={!canEdit}
                    >
                        <SelectTrigger
                            className={clsx(
                                "w-full !h-12 !min-h-[48px] px-4 flex items-center justify-between shadow-xs transition-colors outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                "rounded-md border border-input bg-background text-sm text-foreground",
                                hasSubmitted &&
                                    !departmentId &&
                                    "border-red-500",
                            )}
                        >
                            <div
                                className={
                                    !departmentId
                                        ? "text-muted-foreground"
                                        : "truncate"
                                }
                            >
                                <SelectValue
                                    placeholder={t("selectDepartment")}
                                >
                                    {departmentId
                                        ? departmentOptions.find(
                                              (d) =>
                                                  String(d.id) ===
                                                  String(departmentId),
                                          )?.name
                                        : undefined}
                                </SelectValue>
                            </div>
                        </SelectTrigger>

                        <SelectContent
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignItemWithTrigger={false}
                            className={clsx(
                                "w-[var(--anchor-width)] max-h-60 overflow-y-auto p-0 shadow-xl rounded-none",
                                "border border-[#D1D1D1] bg-[#F5F5F7]",
                                "dark:border-auth-card-border dark:bg-[#454545]",
                            )}
                        >
                            {departmentOptions.map((department) => {
                                const isSelected =
                                    departmentId === String(department.id)
                                return (
                                    <SelectItem
                                        key={department.id}
                                        value={String(department.id)}
                                        className={clsx(
                                            "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                            "[&_svg]:hidden pr-4",
                                            isSelected
                                                ? "bg-[#626262] !text-[#F5F5F7] [&_*]:!text-[#F5F5F7] focus:bg-[#626262] dark:bg-[#F5F5F7] dark:!text-[#2E2E2E] dark:[&_*]:!text-[#2E2E2E]"
                                                : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-[#626262] dark:hover:bg-[#626262]",
                                        )}
                                    >
                                        <span className="font-sans font-normal">
                                            {department.name}
                                        </span>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                    {hasSubmitted && !departmentId && (
                        <span className="text-xs text-red-500">
                            {t("errors.departmentRequired")}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm text-muted-foreground">
                        {t("position")}
                    </label>
                    <Select
                        value={positionId}
                        onValueChange={(val) => setPositionId(val ?? "")}
                        disabled={!canEdit}
                    >
                        <SelectTrigger
                            className={clsx(
                                "w-full !h-12 !min-h-[48px] px-4 flex items-center justify-between shadow-xs transition-colors outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                "rounded-md border border-input bg-background text-sm text-foreground",
                                hasSubmitted && !positionId && "border-red-500",
                            )}
                        >
                            <div
                                className={
                                    !positionId
                                        ? "text-muted-foreground"
                                        : "truncate"
                                }
                            >
                                <SelectValue placeholder={t("selectPosition")}>
                                    {positionId
                                        ? positionOptions.find(
                                              (p) =>
                                                  String(p.id) ===
                                                  String(positionId),
                                          )?.name
                                        : undefined}
                                </SelectValue>
                            </div>
                        </SelectTrigger>

                        <SelectContent
                            side="bottom"
                            align="start"
                            sideOffset={0}
                            alignItemWithTrigger={false}
                            className={clsx(
                                "w-[var(--anchor-width)] max-h-60 overflow-y-auto p-0 shadow-xl rounded-none",
                                "border border-[#D1D1D1] bg-[#F5F5F7]",
                                "dark:border-auth-card-border dark:bg-[#454545]",
                            )}
                        >
                            {positionOptions.map((position) => {
                                const isSelected =
                                    positionId === String(position.id)
                                return (
                                    <SelectItem
                                        key={position.id}
                                        value={String(position.id)}
                                        className={clsx(
                                            "relative flex w-full cursor-pointer items-center px-4 py-3 text-sm outline-none transition-colors rounded-none",
                                            "[&_svg]:hidden pr-4",
                                            isSelected
                                                ? "bg-[#626262] !text-[#F5F5F7] [&_*]:!text-[#F5F5F7] focus:bg-[#626262] dark:bg-[#F5F5F7] dark:!text-[#2E2E2E] dark:[&_*]:!text-[#2E2E2E]"
                                                : "text-gray-900 focus:bg-[#AEAEAE] hover:bg-[#AEAEAE] dark:text-foreground dark:focus:bg-[#626262] dark:hover:bg-[#626262]",
                                        )}
                                    >
                                        <span className="font-sans font-normal">
                                            {position.name}
                                        </span>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
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
