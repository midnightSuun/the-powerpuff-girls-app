"use client"

import { cn } from "cn"
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react"
import { useTranslations } from "next-intl"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "@/i18n/navigation"
import { logout } from "@/modules/auth/api/logout"
import { AUTH_NOTIFICATION_STORAGE_KEY } from "@/modules/auth/consts"

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
    const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

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
                            // Наши новые стили окна меню
                            "border border-[#AEAEAE] dark:border-[#626262]",
                            "bg-[#E2E2E4] dark:bg-[#454545]",
                            "text-[#2E2E2E] dark:text-[#F5F5F7]",
                            "rounded-[8px]",

                            // Оригинальная логика для планшета
                            isTabletExpanded
                                ? "w-36 min-w-0 p-0"
                                : isTabletCollapsed
                                  ? "w-12 min-w-0 p-1"
                                  : "min-w-56",
                        )}
                        side={isMobile ? "bottom" : isTablet ? "top" : "right"}
                        align={
                            isTabletCollapsed
                                ? "center"
                                : isTabletExpanded
                                  ? "end"
                                  : "end"
                        }
                        sideOffset={isTablet ? 0 : 4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                nativeButton={false}
                                render={<Link href={`/users/${user.id}`} />}
                                onClick={handleCloseMobileSidebar}
                                className={
                                    isTabletExpanded
                                        ? "rounded-none px-2.5 py-1.5"
                                        : isTabletCollapsed
                                          ? "justify-center px-0"
                                          : undefined
                                }
                            >
                                <User className="text-current" />
                                <span
                                    className={
                                        isTabletCollapsed
                                            ? "sr-only"
                                            : undefined
                                    }
                                >
                                    {t("profile")}
                                </span>
                            </DropdownMenuItem>

                            {isTablet ? (
                                <DropdownMenuSeparator className="bg-[#AEAEAE] dark:bg-[#626262]" />
                            ) : null}

                            <DropdownMenuItem
                                nativeButton={false}
                                render={<Link href="/settings" />}
                                onClick={handleCloseMobileSidebar}
                                className={
                                    isTabletExpanded
                                        ? "rounded-none px-2.5 py-1.5"
                                        : isTabletCollapsed
                                          ? "justify-center px-0"
                                          : undefined
                                }
                            >
                                <Settings className="text-current" />
                                <span
                                    className={
                                        isTabletCollapsed
                                            ? "sr-only"
                                            : undefined
                                    }
                                >
                                    {t("settings")}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        {!isTablet ? (
                            <DropdownMenuSeparator className="bg-[#AEAEAE] dark:bg-[#626262]" />
                        ) : null}

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className={cn(
                                // Убрали variant="destructive" и оставили стандартное наследование цвета
                                isTabletExpanded
                                    ? "rounded-none px-2.5 py-1.5"
                                    : isTabletCollapsed
                                      ? "justify-center px-0"
                                      : undefined,
                            )}
                        >
                            <LogOut className="text-current" />
                            <span
                                className={
                                    isTabletCollapsed ? "sr-only" : undefined
                                }
                            >
                                {t("logout")}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
