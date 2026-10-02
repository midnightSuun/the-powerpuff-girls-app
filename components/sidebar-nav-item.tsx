"use client"

import { cn } from "cn"
import type { ReactNode } from "react"

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Link, usePathname } from "@/i18n/navigation"

type Props = {
    href: string
    label: string
    children: ReactNode
}

export const SidebarNavItem = ({ href, label, children }: Props) => {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(`${href}/`)

    return (
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
                render={<Link href={href} />}
                isActive={isActive}
                tooltip={label}
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
                {children}
                <span className="group-data-[collapsible=icon]:sr-only">
                    {label}
                </span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
