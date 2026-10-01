import { Suspense } from "react"

import { CvBuilderLogo } from "@/components/cv-builder-logo"
import { SidebarNav } from "@/components/sidebar-nav"
import { SidebarToggle } from "@/components/sidebar-toggle"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { NavUser } from "@/modules/users"

const SidebarUserFallback = () => {
    return (
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Skeleton className="size-8 rounded-full" />
            <div className="grid flex-1 gap-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    )
}

export function AppSidebar() {
    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="gap-2 group-data-[collapsible=icon]:items-center">
                <div className="flex min-w-0 items-center gap-2 px-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-0">
                    <CvBuilderLogo className="size-6 shrink-0" />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                        CV Builder
                    </p>
                    <SidebarToggle />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarNav />
            </SidebarContent>
            <SidebarFooter>
                <Suspense fallback={<SidebarUserFallback />}>
                    <NavUser />
                </Suspense>
                <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
            </SidebarFooter>
        </Sidebar>
    )
}
