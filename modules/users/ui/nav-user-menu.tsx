"use client"

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
    const isTabletExpanded = isTablet && state === "expanded"
    const isTabletCollapsed = isTablet && state === "collapsed"
    const fullName = getUserDisplayName(
        user.firstName,
        user.lastName,
        user.email,
    )
    const itemClassName = isTabletExpanded
        ? "rounded-none px-2.5 py-1.5"
        : isTabletCollapsed
          ? "justify-center px-0"
          : undefined
    const labelClassName = isTabletCollapsed ? "sr-only" : undefined

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
                        className={
                            isTabletExpanded
                                ? "w-36 min-w-0 rounded-md p-0"
                                : isTabletCollapsed
                                  ? "w-12 min-w-0 rounded-md p-1"
                                  : "min-w-56 rounded-lg"
                        }
                        side={isMobile ? "bottom" : isTablet ? "top" : "right"}
                        align={isTabletCollapsed ? "center" : "end"}
                        sideOffset={isTablet ? 0 : 4}
                    >
                        <DropdownMenuGroup>
                            <NavUserMenuItem
                                href={`/users/${user.id}`}
                                label={t("profile")}
                                icon={<User />}
                                itemClassName={itemClassName}
                                labelClassName={labelClassName}
                                onClick={handleCloseMobileSidebar}
                            />
                            {isTablet ? <DropdownMenuSeparator /> : null}
                            <NavUserMenuItem
                                href="/settings"
                                label={t("settings")}
                                icon={<Settings />}
                                itemClassName={itemClassName}
                                labelClassName={labelClassName}
                                onClick={handleCloseMobileSidebar}
                            />
                        </DropdownMenuGroup>
                        {!isTablet ? <DropdownMenuSeparator /> : null}
                        <NavUserMenuItem
                            label={t("logout")}
                            icon={<LogOut />}
                            variant="destructive"
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
