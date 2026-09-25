import { LogoutButton } from "@/modules/auth"

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <header>
                <LogoutButton />
            </header>
            <main>{children}</main>
        </>
    )
}
