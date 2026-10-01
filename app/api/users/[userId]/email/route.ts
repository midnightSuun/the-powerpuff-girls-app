import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { isAuthorized } from "@/modules/auth/helpers/is-authorized"
import { getUser } from "@/modules/users/api/get-user"

type Props = {
    params: Promise<{ userId: string }>
}

export async function GET(_request: Request, { params }: Props) {
    const cookieStore = await cookies()

    if (!isAuthorized(cookieStore)) {
        return NextResponse.json({ email: null }, { status: 401 })
    }

    const { userId } = await params

    try {
        const user = await getUser(userId)

        return NextResponse.json({ email: user.email })
    } catch {
        return NextResponse.json({ email: null }, { status: 404 })
    }
}
