import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "../consts"

type CookieStore = { get: (name: string) => { value: string } | undefined }

export const isAuthorized = (cookieStore: CookieStore) => {
    const hasAccess = Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value)
    const hasRefresh = Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value)

    return hasAccess || hasRefresh
}
