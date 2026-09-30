export default function ProtectedLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <main>{children}</main>
        </>
    )
}
