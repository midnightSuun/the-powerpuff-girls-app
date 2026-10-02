import { redirect } from "@/i18n/navigation"

type Props = {
    params: Promise<{ locale: string; userId: string }>
}

const UserPage = async ({ params }: Props) => {
    const { locale, userId } = await params

    redirect({ href: `/users/${userId}/profile`, locale })
}

export default UserPage
