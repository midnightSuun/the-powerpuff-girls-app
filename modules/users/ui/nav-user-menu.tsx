"use client"

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
    const { isMobile, setOpenMobile } = useSidebar()
    const t = useTranslations("User.nav")
    const fullName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

    const handleCloseMobileSidebar = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    const handleLogout = () => {
        handleCloseMobileSidebar()
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
                            <span className="truncate text-xs text-muted-foreground">
                                {t("viewProfile")}
                            </span>
                        </div>
                        <ChevronsUpDown
                            className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden"
                            aria-hidden
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                nativeButton={false}
                                render={<Link href={`/users/${user.id}`} />}
                                onClick={handleCloseMobileSidebar}
                            >
                                <User />
                                {t("profile")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                nativeButton={false}
                                render={<Link href="/settings" />}
                                onClick={handleCloseMobileSidebar}
                            >
                                <Settings />
                                {t("settings")}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={handleLogout}
                        >
                            <LogOut />
                            {t("logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
