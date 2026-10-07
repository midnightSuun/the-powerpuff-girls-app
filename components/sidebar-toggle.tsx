"use client"

import { cn } from "cn"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"

export const SidebarToggle = () => {
    const { toggleSidebar, state, isMobile, isTablet, openMobile } =
        useSidebar()
    const isSidebarOpen = isMobile ? openMobile : state === "expanded"

    const handleToggleSidebar = () => {
        toggleSidebar()
    }

    return (
        <button
            type="button"
            onClick={handleToggleSidebar}
            aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            aria-expanded={isSidebarOpen}
            className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                isTablet &&
                    "absolute top-10 right-0 z-40 size-6 translate-x-1/2 rounded-full border border-sidebar-border bg-sidebar shadow-sm hover:bg-sidebar-accent",
            )}
        >
            {isSidebarOpen ? (
                <ChevronLeft className={cn("size-4", isTablet && "size-3")} />
            ) : (
                <ChevronRight className={cn("size-4", isTablet && "size-3")} />
            )}
        </button>
    )
}
