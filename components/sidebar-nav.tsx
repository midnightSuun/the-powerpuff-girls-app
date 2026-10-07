"use client"

import { cn } from "cn"
import {
    Briefcase,
    Building,
    ChartLine,
    File,
    Folders,
    Languages,
    type LucideIcon,
    Users,
} from "lucide-react"
import { useTranslations } from "next-intl"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, usePathname } from "@/i18n/navigation"

type SidebarItem = {
    label:
        | "employees"
        | "skills"
        | "languages"
        | "cvs"
        | "departments"
        | "positions"
        | "projects"
    icon: LucideIcon
    href: string
}

const sidebarItems: SidebarItem[] = [
    {
        label: "employees",
        icon: Users,
        href: "/users",
    },
    {
        label: "skills",
        icon: ChartLine,
        href: "/skills",
    },
    {
        label: "languages",
        icon: Languages,
        href: "/languages",
    },
    {
        label: "cvs",
        icon: File,
        href: "/cv",
    },
]

const adminSidebarItems: SidebarItem[] = [
    {
        label: "departments",
        icon: Building,
        href: "/departments",
    },
    {
        label: "positions",
        icon: Briefcase,
        href: "/positions",
    },
    {
        label: "projects",
        icon: Folders,
        href: "/projects",
    },
]

type SidebarNavProps = {
    isAdmin: boolean
    viewerId: string | null
}

export const SidebarNav = ({ isAdmin, viewerId }: SidebarNavProps) => {
    const pathname = usePathname()
    const t = useTranslations("Navigation")

    const userProfileMatch = pathname.match(/^\/users\/([^/]+)(?:\/|$)/)
    const isOtherUserProfile =
        userProfileMatch !== null && userProfileMatch[1] !== viewerId

    const renderItem = (item: SidebarItem) => {
        const Icon = item.icon
        const isActive =
            item.href === "/users"
                ? pathname === item.href || isOtherUserProfile
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
            <SidebarMenuItem
                key={item.label}
                className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
            >
                <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    tooltip={t(item.label)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                        "h-10 rounded-full px-3 font-normal text-button-secondary-default no-underline",
                        "hover:bg-[#ececee] hover:text-button-secondary-default hover:no-underline dark:hover:bg-white/10 dark:hover:text-foreground",
                        "data-active:bg-[#e6e6e8] data-active:font-normal data-active:text-[#3a3a3a] dark:data-active:bg-white/15 dark:data-active:text-foreground",
                        "[&_svg]:size-4.5",
                        "group-data-[collapsible=icon]:text-[#3a3a3a] dark:group-data-[collapsible=icon]:text-foreground",
                        "group-data-[collapsible=icon]:data-active:text-[#3a3a3a] dark:group-data-[collapsible=icon]:data-active:text-foreground",
                    )}
                >
                    <Icon strokeWidth={1.75} />
                    <span className="group-data-[collapsible=icon]:sr-only">
                        {t(item.label)}
                    </span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <SidebarGroup className="px-3 py-1">
            <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3">
                    {sidebarItems.map(renderItem)}
                    {isAdmin ? (
                        <>
                            <li
                                aria-hidden
                                className="flex justify-center py-2 group-data-[collapsible=icon]:hidden"
                            >
                                <svg
                                    width="200"
                                    height="1"
                                    viewBox="0 0 200 1"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M0 0H200V1H0V0Z" fill="#AEAEAE" />
                                </svg>
                            </li>
                            {adminSidebarItems.map(renderItem)}
                        </>
                    ) : null}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
