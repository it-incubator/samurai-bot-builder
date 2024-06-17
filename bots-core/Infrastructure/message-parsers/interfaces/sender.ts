export interface ISender {
    id: number
    is_bot: boolean
    first_name: string
    last_name: string
    username?: string
    language_code: "en" | "ru" | string
}
