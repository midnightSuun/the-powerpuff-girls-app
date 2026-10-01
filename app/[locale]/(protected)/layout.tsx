import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <PageHeader />
                <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
