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
import { getAuthUserId } from "@/modules/skills/helpers/get-auth-user-id"
import { UserAvatar } from "@/modules/users"
import { getUser } from "@/modules/users/api/get-user"

const SidebarUser = async () => {
    const userId = await getAuthUserId()

    if (!userId) {
        return null
    }

    const user = await getUser(userId)
    const firstName = user.profile.first_name
    const lastName = user.profile.last_name
    const fullName =
        [firstName, lastName].filter(Boolean).join(" ") || user.email

    return (
        <div className="flex min-w-0 items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <UserAvatar
                src={user.profile.avatar}
                firstName={firstName}
                lastName={lastName}
                email={user.email}
                fallbackClassName="bg-[#c63031] text-white"
            />
            <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
                {fullName}
            </span>
        </div>
    )
}

const SidebarUserFallback = () => {
    return (
        <div className="flex items-center gap-2 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-28 group-data-[collapsible=icon]:hidden" />
        </div>
    )
}

const SidebarNavFallback = () => {
    return (
        <div className="flex flex-col gap-1 px-3 py-1">
            {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-10 rounded-full" />
            ))}
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
                <Suspense fallback={<SidebarNavFallback />}>
                    <SidebarNav />
                </Suspense>
            </SidebarContent>
            <SidebarFooter>
                <Suspense fallback={<SidebarUserFallback />}>
                    <SidebarUser />
                </Suspense>
                <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
            </SidebarFooter>
        </Sidebar>
    )
}
