"use client"

import { cn } from "cn"
import { ChevronLeft } from "lucide-react"
import { ChevronRight } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"

export const SidebarToggle = () => {
    const { toggleSidebar, state, isMobile, openMobile } = useSidebar()
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
            )}
        >
            {isSidebarOpen ? (
                <ChevronLeft className="size-4" />
            ) : (
                <ChevronRight className="size-4" />
            )}
        </button>
    )
}
