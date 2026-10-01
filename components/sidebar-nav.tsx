import { cn } from "cn"
import {
    ChartLine,
    File,
    Languages,
    type LucideIcon,
    Users,
} from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

type SidebarItem = {
    label: string
    icon: LucideIcon
    href: string
}

const sidebarItems: SidebarItem[] = [
    {
        label: "Employees",
        icon: Users,
        href: "/users",
    },
    {
        label: "Skills",
        icon: ChartLine,
        href: "/skills",
    },
    {
        label: "Languages",
        icon: Languages,
        href: "/languages",
    },
    {
        label: "CVs",
        icon: File,
        href: "/cv",
    },
]

export const SidebarNav = async () => {
    const pathname = (await headers()).get("x-pathname") ?? ""

    return (
        <SidebarGroup className="px-3 py-1">
            <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`)

                        return (
                            <SidebarMenuItem
                                key={item.label}
                                className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                            >
                                <SidebarMenuButton
                                    render={<Link href={item.href} />}
                                    isActive={isActive}
                                    tooltip={item.label}
                                    aria-current={isActive ? "page" : undefined}
                                    className={cn(
                                        "h-10 rounded-full px-3 font-normal text-[#626262] no-underline",
                                        "hover:bg-[#ececee] hover:text-[#626262] hover:no-underline",
                                        "data-active:bg-[#e6e6e8] data-active:font-normal data-active:text-[#3a3a3a]",
                                        "[&_svg]:size-[18px]",
                                        "group-data-[collapsible=icon]:text-[#3a3a3a]",
                                        "group-data-[collapsible=icon]:data-active:bg-transparent",
                                        "group-data-[collapsible=icon]:data-active:text-[#3a3a3a]",
                                    )}
                                >
                                    <Icon strokeWidth={1.75} />
                                    <span className="group-data-[collapsible=icon]:sr-only">
                                        {item.label}
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
