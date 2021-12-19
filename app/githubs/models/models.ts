export interface IGithubQuery {
    search?: IGithubQuerySearch
    order?: IGithubQueryOrder
}

export interface IGithubQueryOrder {
    orderBy?: string
    orderDirection?: string
}

export interface IGithubQuerySearch {
    fulltext?: string
    topics?: string[]
    languages?: string[]
}