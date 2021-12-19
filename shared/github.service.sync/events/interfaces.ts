export interface IServerSyncEvent {
    key: string
    title: string
    message: string
}

export interface IServerStartSyncEvent {
    title: string
    message: string
    processName: string
    totalPages: number
}


export interface IServerProgressSyncEvent {
    ok?: boolean,
    message?: string,
    page?: number,
    pages?: number
}

export interface IServerEndSyncEvent {
    key: string
}

export interface IClientSyncEvent {
    sessionUserId: number
}