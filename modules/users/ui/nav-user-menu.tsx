"use client"

import { cn } from "cn"
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react"
import { useTranslations } from "next-intl"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { logout } from "@/modules/auth/api/logout"
import { AUTH_NOTIFICATION_STORAGE_KEY } from "@/modules/auth/consts"

import { getUserDisplayName } from "../get-user-display-name"
import { NavUserMenuItem } from "./nav-user-menu-item"
import { UserAvatar } from "./user-avatar"

export type NavUserData = {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
}

type Props = {
    user: NavUserData
}

export const NavUserMenu = ({ user }: Props) => {
    const { isMobile, isTablet, state, setOpenMobile } = useSidebar()
    const t = useTranslations("User.nav")
    const isCompactMenu = !isMobile && state === "collapsed"
    const isTabletExpanded = isTablet && state === "expanded"
    const fullName = getUserDisplayName(
        user.firstName,
        user.lastName,
        user.email,
    )
    const itemClassName = isTabletExpanded
        ? "rounded-none px-2.5 py-1.5"
        : isCompactMenu
          ? "justify-center px-0"
          : undefined
    const labelClassName = isCompactMenu ? "sr-only" : undefined

    const handleCloseMobileSidebar = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    const handleLogout = () => {
        handleCloseMobileSidebar()
        sessionStorage.setItem(AUTH_NOTIFICATION_STORAGE_KEY, "logout")
        void logout()
    }

    return (
        <SidebarMenu className="w-full">
            <SidebarMenuItem className="w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="w-full"
                        render={
                            <SidebarMenuButton
                                size="lg"
                                aria-label={fullName}
                                className="h-auto w-full data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                            />
                        }
                    >
                        <UserAvatar
                            src={user.avatar}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            email={user.email}
                            fallbackClassName="bg-[#c63031] text-white"
                        />
                        <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                            <span className="truncate font-medium">
                                {fullName}
                            </span>
                            {!isTablet ? (
                                <span className="truncate text-xs text-muted-foreground">
                                    {t("viewProfile")}
                                </span>
                            ) : null}
                        </div>
                        <ChevronsUpDown
                            className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden"
                            aria-hidden
                        />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className={cn(
                            "border border-[#AEAEAE] dark:border-button-secondary-default",
                            "bg-text-primary-disabled dark:bg-[#454545]",
                            "text-[#2E2E2E] dark:text-[#F5F5F7]",
                            "rounded-[8px]",

                            isTabletExpanded
                                ? "w-36 min-w-0 p-0"
                                : isCompactMenu
                                  ? "w-12 min-w-0 p-1"
                                  : "min-w-56",
                        )}
                        side={
                            isMobile
                                ? "bottom"
                                : isTablet || isCompactMenu
                                  ? "top"
                                  : "right"
                        }
                        align={isCompactMenu ? "center" : "end"}
                        sideOffset={isTablet || isCompactMenu ? 0 : 4}
                    >
                        <DropdownMenuGroup>
                            <NavUserMenuItem
                                href={`/users/${user.id}`}
                                label={t("profile")}
                                icon={<User className="text-current" />}
                                itemClassName={itemClassName}
                                labelClassName={labelClassName}
                                onClick={handleCloseMobileSidebar}
                            />

                            {isTablet || isCompactMenu ? (
                                <DropdownMenuSeparator className="bg-[#AEAEAE] dark:bg-button-secondary-default" />
                            ) : null}

                            <NavUserMenuItem
                                href="/settings"
                                label={t("settings")}
                                icon={<Settings className="text-current" />}
                                itemClassName={itemClassName}
                                labelClassName={labelClassName}
                                onClick={handleCloseMobileSidebar}
                            />
                        </DropdownMenuGroup>

                        {!isTablet && !isCompactMenu ? (
                            <DropdownMenuSeparator className="bg-[#AEAEAE] dark:bg-button-secondary-default" />
                        ) : null}

                        <NavUserMenuItem
                            label={t("logout")}
                            icon={<LogOut className="text-current" />}
                            itemClassName={itemClassName}
                            labelClassName={labelClassName}
                            onClick={handleLogout}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
