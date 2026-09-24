"use server"

import { redirect } from "next/navigation"

import { getGql, LoginDocument } from "@/gql"

import { setTokens } from "../tokens"

type Props = {
    email: string
    password: string
}

export async function login({ email, password }: Props) {
    const gql = await getGql()
    const data = await gql.request(LoginDocument, { auth: { email, password } })

    await setTokens(data.login.access_token, data.login.refresh_token)

    redirect("/")
}
