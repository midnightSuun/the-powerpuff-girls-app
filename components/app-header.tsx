"use client"

import { CvBuilderLogo } from "@/components/cv-builder-logo"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { useSidebar } from "@/components/ui/sidebar"

export const AppHeader = () => {
    const { isMobile, openMobile } = useSidebar()

    if (!isMobile || openMobile) {
        return null
    }

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <CvBuilderLogo className="size-6 shrink-0" />
            <p className="text-sm font-medium text-foreground">CV Builder</p>
            <SidebarToggle />
        </header>
    )
}
