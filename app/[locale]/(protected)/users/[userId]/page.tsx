import { redirect } from "@/i18n/navigation"

type Props = {
    params: Promise<{ locale: string; userId: string }>
}

export default async function UserDetailRoute({ params }: Props) {
    const { locale, userId } = await params

    redirect({ href: `/users/${userId}/profile`, locale })
}
