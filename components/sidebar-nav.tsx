import {
    ChartLine,
    File,
    Languages,
    type LucideIcon,
    Users,
} from "lucide-react"

import { SidebarNavItem } from "@/components/sidebar-nav-item"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
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

export const SidebarNav = () => {
    return (
        <SidebarGroup className="px-3 py-1">
            <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <SidebarNavItem
                                key={item.label}
                                href={item.href}
                                label={item.label}
                            >
                                <Icon strokeWidth={1.75} />
                            </SidebarNavItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
