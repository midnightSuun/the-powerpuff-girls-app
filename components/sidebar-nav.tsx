import {
    ChartLine,
    File,
    Languages,
    type LucideIcon,
    Users,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

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

export const SidebarNav = async () => {
    const tUsers = await getTranslations("Users")
    const tSkills = await getTranslations("Skills")
    const tLanguages = await getTranslations("Languages")
    const tCvs = await getTranslations("Cvs")

    const sidebarItems: SidebarItem[] = [
        {
            label: tUsers("title"),
            icon: Users,
            href: "/users",
        },
        {
            label: tSkills("title"),
            icon: ChartLine,
            href: "/skills",
        },
        {
            label: tLanguages("title"),
            icon: Languages,
            href: "/languages",
        },
        {
            label: tCvs("title"),
            icon: File,
            href: "/cv",
        },
    ]

    return (
        <SidebarGroup className="px-3 py-1">
            <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-3">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon

                        return (
                            <SidebarNavItem
                                key={item.href}
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
