export interface Paged<T> {
    page: number
    totalPages: number
    totalItems: number
    items: T[]
}

export interface IGithubDto {
    id: number
    name: string
    full_name: string
    html_url: string
    url: string
    description: string
    stargazers_count: number
    avatar_url: string
    latest_commit: string
    topics?: string[]
    languages?: {
        [key: string]: number
    }
}

export interface ITopicGroupDto {
    topic: string
    count: number
}